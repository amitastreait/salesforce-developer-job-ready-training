import { LightningElement, api } from 'lwc';

export default class StarRating extends LightningElement {
    // public API
    @api value = 0; // current rating (can be decimal if allowHalf)
    @api max = 5; // number of stars
    @api readOnly = false; // display only
    @api allowHalf = false; // allow 0.5 increments using hover/click
    @api size = 'medium'; // small | medium | large
    @api color; // optional CSS color value for filled stars
    @api ariaLabel = 'Rating';
    @api showValueText = false; // optionally show "X/Y" text

    // internal state
    hoveringIndex = null; // 0-based star index being hovered
    hoveringFraction = 1; // 0.5 or 1 when allowHalf
    hasPendingChange = false;

    get sizeClass() {
        return `star-rating size-${this.size}`;
    }

    get tabIndex() {
        return this.readOnly ? -1 : 0;
    }

    get ariaLabelComputed() {
        return this.ariaLabel || 'Rating';
    }

    get displayValue() {
        // When hovering, show the preview value
        if (this.hoveringIndex !== null) {
            const preview = this.hoveringIndex + this.hoveringFraction;
            return Math.min(this.max, Math.max(0, preview));
        }
        return Math.min(this.max, Math.max(0, this.value));
    }

    get stars() {
        const stars = [];
        const current = this.displayValue;
        for (let i = 0; i < this.max; i++) {
            const isFull = current >= i + 1;
            const isPartial = current > i && current < i + 1;
            const fillPercent = isFull ? 100 : isPartial ? Math.round((current - i) * 100) : 0;

            const className = [
                'star',
                isFull ? 'full' : '',
                isPartial ? 'partial' : '',
                this.readOnly ? 'readonly' : ''
            ]
                .filter(Boolean)
                .join(' ');

            const fillColor = this.color ? this.color : 'var(--star-rating-color, #f5a623)';
            const fillStyle = `clip-path: inset(0 ${100 - fillPercent}% 0 0); `; //background-color:${fillColor};

            stars.push({
                index: i,
                className,
                fillStyle,
                aria: `Set rating to ${i + 1} star${i + 1 === 1 ? '' : 's'}`,
                title: `${i + 1}/${this.max}`
            });
        }
        return stars;
    }

    // Mouse interactions
    handleMouseMove(event) {
        if (this.readOnly) return;
        const index = Number(event.currentTarget?.dataset?.index);
        if (Number.isNaN(index)) return;

        let fraction = 1;
        if (this.allowHalf) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            fraction = x < rect.width / 2 ? 0.5 : 1;
        }
        this.hoveringIndex = index;
        this.hoveringFraction = fraction;
    }

    handleMouseLeave() {
        if (this.readOnly) return;
        this.hoveringIndex = null;
        this.hoveringFraction = 1;
    }

    handleClick(event) {
        if (this.readOnly) return;
        const index = Number(event.currentTarget?.dataset?.index);
        if (Number.isNaN(index)) return;

        const newValue = this.allowHalf && this.hoveringIndex === index ? index + this.hoveringFraction : index + 1;
        this.setValue(newValue, true);
    }

    // Keyboard interactions
    handleKeydown(event) {
        if (this.readOnly) return;
        const key = event.key;
        let handled = false;
        let newValue = this.value;

        switch (key) {
            case 'ArrowRight':
            case 'ArrowUp':
                newValue = Math.min(this.max, this.value + (this.allowHalf ? 0.5 : 1));
                handled = true;
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                newValue = Math.max(0, this.value - (this.allowHalf ? 0.5 : 1));
                handled = true;
                break;
            case 'Home':
                newValue = 0;
                handled = true;
                break;
            case 'End':
                newValue = this.max;
                handled = true;
                break;
            case 'Enter':
            case ' ':
                // commit current value
                this.dispatchEvent(
                    new CustomEvent('commit', {
                        detail: { value: this.value }
                    })
                );
                handled = true;
                break;
            default:
        }

        if (handled) {
            event.preventDefault();
            this.setValue(newValue, true);
        }
    }

    handleBlur() {
        if (this.hasPendingChange) {
            this.dispatchEvent(
                new CustomEvent('commit', {
                    detail: { value: this.value }
                })
            );
            this.hasPendingChange = false;
        }
        // clear any hover preview
        this.hoveringIndex = null;
        this.hoveringFraction = 1;
    }

    setValue(newValue, fireChange) {
        const clamped = Math.min(this.max, Math.max(0, this.normalizeStep(newValue)));
        if (clamped !== this.value) {
            this.value = clamped;
            if (fireChange) {
                this.hasPendingChange = true;
                alert('Value changed '+ this.value);
                this.dispatchEvent(
                    new CustomEvent('ratingchange', {
                        detail: { value: this.value }
                    })
                );
            }
        }
    }

    normalizeStep(v) {
        if (!this.allowHalf) return Math.round(v);
        // normalize to nearest 0.5
        return Math.round(v * 2) / 2;
    }
}
