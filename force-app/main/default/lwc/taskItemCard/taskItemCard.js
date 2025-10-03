import { LightningElement, api } from 'lwc';

/**
 * Task Item Card Component
 * Displays individual task with complete, edit, and delete functionality
 */
export default class TaskItemCard extends LightningElement {
    
    /**
     * @api task - Task object containing task details
     * Structure: {
     *   id, title, description, category, priority, 
     *   dueDate, isCompleted, createdDate
     * }
     */
    @api task;
    
    /**
     * Generate unique checkbox ID for label association
     */
    get checkboxId() {
        return `checkbox-${this.task.id}`;
    }
    
    /**
     * Dynamic CSS class for task card based on completion status
     */
    get taskCardClass() {
        return this.task.isCompleted 
            ? 'task-card completed' 
            : 'task-card';
    }
    
    /**
     * Dynamic CSS class for task title
     */
    get taskTitleClass() {
        return this.task.isCompleted 
            ? 'task-title strikethrough' 
            : 'task-title';
    }
    
    /**
     * Category badge styling based on category
     */
    get categoryBadgeClass() {
        const categoryClasses = {
            'Work': 'badge category-work',
            'Personal': 'badge category-personal',
            'Shopping': 'badge category-shopping',
            'Health': 'badge category-health',
            'Other': 'badge category-other'
        };
        return categoryClasses[this.task.category] || 'badge category-other';
    }
    
    /**
     * Get icon for category
     */
    get categoryIcon() {
        const icons = {
            'Work': 'utility:office',
            'Personal': 'utility:user',
            'Shopping': 'utility:cart',
            'Health': 'utility:favorite',
            'Other': 'utility:apps'
        };
        return icons[this.task.category] || 'utility:apps';
    }
    
    /**
     * Priority badge styling
     */
    get priorityBadgeClass() {
        const priorityClasses = {
            'High': 'badge priority-high',
            'Medium': 'badge priority-medium',
            'Low': 'badge priority-low'
        };
        return priorityClasses[this.task.priority] || 'badge priority-low';
    }
    
    /**
     * Format due date for display
     */
    get formattedDueDate() {
        if (!this.task.dueDate) return '';
        
        const dueDate = new Date(this.task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} day(s)`;
        } else if (diffDays === 0) {
            return 'Due Today';
        } else if (diffDays === 1) {
            return 'Due Tomorrow';
        } else {
            return `Due in ${diffDays} day(s)`;
        }
    }
    
    /**
     * CSS class for due date based on urgency
     */
    get dueDateClass() {
        if (!this.task.dueDate) return 'badge due-date';
        
        const dueDate = new Date(this.task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'badge due-date overdue';
        } else if (diffDays === 0) {
            return 'badge due-date today';
        } else if (diffDays <= 3) {
            return 'badge due-date soon';
        } else {
            return 'badge due-date';
        }
    }
    
    /**
     * Handle checkbox toggle - mark task as complete/incomplete
     */
    handleToggleComplete() {
        const toggleEvent = new CustomEvent('togglecomplete', {
            detail: { taskId: this.task.id },
            bubbles: true
        });
        this.dispatchEvent(toggleEvent);
    }
    
    /**
     * Handle edit button click
     */
    handleEdit() {
        const editEvent = new CustomEvent('edittask', {
            detail: { taskId: this.task.id, task: this.task },
            bubbles: true
        });
        this.dispatchEvent(editEvent);
    }
    
    /**
     * Handle delete button click
     */
    handleDelete() {
        const deleteEvent = new CustomEvent('deletetask', {
            detail: { taskId: this.task.id },
            bubbles: true
        });
        this.dispatchEvent(deleteEvent);
    }
}