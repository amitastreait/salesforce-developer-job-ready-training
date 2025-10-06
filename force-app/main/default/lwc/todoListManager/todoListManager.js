import { LightningElement, track } from 'lwc';
import { getFocusedTabInfo, setTabLabel, setTabIcon } from 'lightning/platformWorkspaceApi';

/**
 * To-Do List Manager Component
 * Main component for managing tasks with CRUD operations and filtering
 */
export default class TodoListManager extends LightningElement {

    @track tasks = [];
    nextTaskId = 1;

    taskTitle = '';
    taskDescription = '';
    taskCategory = 'Personal';
    taskPriority = 'Medium';
    taskDueDate = '';

    isEditMode = false;
    editingTaskId = null;

    searchTerm = '';
    filterStatus = 'all';
    filterCategory = 'all';
    filterPriority = 'all';
    sortBy = 'date-desc';
    
    categoryOptions = [
        { label: 'Work', value: 'Work' },
        { label: 'Personal', value: 'Personal' },
        { label: 'Shopping', value: 'Shopping' },
        { label: 'Health', value: 'Health' },
        { label: 'Other', value: 'Other' }
    ];
    
    priorityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
    ];
    
    statusFilterOptions = [
        { label: 'All Tasks', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' }
    ];
    
    categoryFilterOptions = [
        { label: 'All Categories', value: 'all' },
        { label: 'Work', value: 'Work' },
        { label: 'Personal', value: 'Personal' },
        { label: 'Shopping', value: 'Shopping' },
        { label: 'Health', value: 'Health' },
        { label: 'Other', value: 'Other' }
    ];
    
    priorityFilterOptions = [
        { label: 'All Priorities', value: 'all' },
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
    ];

    connectedCallback() {
        // Load tasks from localStorage
        this.loadTasksFromStorage();
        
        // Add sample tasks if none exist
        if (this.tasks.length === 0) {
            this.addSampleTasks();
        }

        // Get the current focused tab
        getFocusedTabInfo().then(tabInfo => {
            const tabId = tabInfo.tabId;
            setTabLabel(tabId, 'Task Manager');
            setTabIcon(tabId, 'standard:task', {
                iconAlt: 'Task Manager'
            });
        });
    }
    
    get formTitle() {
        return this.isEditMode ? 'Edit Task' : 'Add New Task';
    }
    
    get submitButtonLabel() {
        return this.isEditMode ? 'Update Task' : 'Add Task';
    }
    
    get isSubmitDisabled() {
        return !this.taskTitle || !this.taskCategory || !this.taskPriority;
    }
    
    get totalTasks() {
        return this.tasks.length;
    }
    
    get completedTasks() {
        return this.tasks.filter(task => task.isCompleted).length;
    }
    
    get pendingTasks() {
        return this.tasks.filter(task => !task.isCompleted).length;
    }
    
    get completionRate() {
        if (this.totalTasks === 0) return 0;
        return Math.round((this.completedTasks / this.totalTasks) * 100);
    }
    
    get filteredTasks() {
        let filtered = [...this.tasks];
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchLower) ||
                (task.description && task.description.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply status filter
        if (this.filterStatus === 'active') {
            filtered = filtered.filter(task => !task.isCompleted);
        } else if (this.filterStatus === 'completed') {
            filtered = filtered.filter(task => task.isCompleted);
        }
        
        // Apply category filter
        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(task => task.category === this.filterCategory);
        }
        
        // Apply priority filter
        if (this.filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === this.filterPriority);
        }
        
        // Apply sorting
        filtered = this.sortTasks(filtered);
        
        return filtered;
    }
    
    get filteredTasksCount() {
        return this.filteredTasks.length;
    }
    
    get hasTasks() {
        return this.filteredTasks.length > 0;
    }
    
    get emptyStateTitle() {
        if (this.tasks.length === 0) {
            return 'No tasks yet';
        }
        return 'No tasks found';
    }
    
    get emptyStateMessage() {
        if (this.tasks.length === 0) {
            return 'Create your first task to get started!';
        }
        return 'Try adjusting your filters or search criteria';
    }

    handleTitleChange(event) {
        this.taskTitle = event.target.value;
    }
    
    handleDescriptionChange(event) {
        this.taskDescription = event.target.value;
    }
    
    handleCategoryChange(event) {
        this.taskCategory = event.target.value;
    }
    
    handlePriorityChange(event) {
        this.taskPriority = event.target.value;
    }
    
    handleDueDateChange(event) {
        this.taskDueDate = event.target.value;
    }
    
    handleSubmit() {
        if (this.isSubmitDisabled) return;
        
        if (this.isEditMode) {
            this.updateTask();
        } else {
            this.addTask();
        }
    }
    
    handleCancelEdit() {
        this.resetForm();
    }
    
    addTask() {
        const newTask = {
            id: this.nextTaskId++,
            title: this.taskTitle,
            description: this.taskDescription,
            category: this.taskCategory,
            priority: this.taskPriority,
            dueDate: this.taskDueDate,
            isCompleted: false,
            createdDate: new Date().toISOString()
        };
        
        this.tasks = [...this.tasks, newTask];
        this.saveTasksToStorage();
        this.resetForm();
        this.showToast('Success', 'Task added successfully!', 'success');
    }
    
    updateTask() {
        this.tasks = this.tasks.map(task => {
            if (task.id === this.editingTaskId) {
                return {
                    ...task,
                    title: this.taskTitle,
                    description: this.taskDescription,
                    category: this.taskCategory,
                    priority: this.taskPriority,
                    dueDate: this.taskDueDate
                };
            }
            return task;
        });
        
        this.saveTasksToStorage();
        this.resetForm();
        this.showToast('Success', 'Task updated successfully!', 'success');
    }
    
    handleToggleComplete(event) {
        const taskId = event.detail.taskId;
        
        this.tasks = this.tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, isCompleted: !task.isCompleted };
            }
            return task;
        });
        
        this.saveTasksToStorage();
    }
    
    handleEditTask(event) {
        const { task } = event.detail;
        
        this.isEditMode = true;
        this.editingTaskId = task.id;
        this.taskTitle = task.title;
        this.taskDescription = task.description || '';
        this.taskCategory = task.category;
        this.taskPriority = task.priority;
        this.taskDueDate = task.dueDate || '';
        
        // Scroll to form
        this.scrollToTop();
    }
    
    handleDeleteTask(event) {
        const taskId = event.detail.taskId;
        
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasksToStorage();
            this.showToast('Success', 'Task deleted successfully!', 'success');
        }
    }
    
    handleSearch(event) {
        this.searchTerm = event.target.value;
    }
    
    handleStatusFilter(event) {
        this.filterStatus = event.target.value;
    }
    
    handleCategoryFilter(event) {
        this.filterCategory = event.target.value;
    }
    
    handlePriorityFilter(event) {
        this.filterPriority = event.target.value;
    }
    
    handleClearFilters() {
        this.searchTerm = '';
        this.filterStatus = 'all';
        this.filterCategory = 'all';
        this.filterPriority = 'all';
    }
    
    handleSort(event) {
        this.sortBy = event.detail.value;
    }
    
    sortTasks(tasks) {
        const sorted = [...tasks];
        
        switch (this.sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => 
                    new Date(b.createdDate) - new Date(a.createdDate)
                );
            case 'date-asc':
                return sorted.sort((a, b) => 
                    new Date(a.createdDate) - new Date(b.createdDate)
                );
            case 'priority':
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return sorted.sort((a, b) => 
                    priorityOrder[a.priority] - priorityOrder[b.priority]
                );
            case 'duedate':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            default:
                return sorted;
        }
    }
    
    resetForm() {
        this.taskTitle = '';
        this.taskDescription = '';
        this.taskCategory = 'Personal';
        this.taskPriority = 'Medium';
        this.taskDueDate = '';
        this.isEditMode = false;
        this.editingTaskId = null;
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    saveTasksToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            localStorage.setItem('nextTaskId', this.nextTaskId.toString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    loadTasksFromStorage() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            const savedNextId = localStorage.getItem('nextTaskId');
            
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
            
            if (savedNextId) {
                this.nextTaskId = parseInt(savedNextId, 10);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    addSampleTasks() {
        const sampleTasks = [
            {
                id: this.nextTaskId++,
                title: 'Complete LWC Assignment',
                description: 'Finish the To-Do List mini project',
                category: 'Work',
                priority: 'High',
                dueDate: this.getTomorrowDate(),
                isCompleted: false,
                createdDate: new Date().toISOString()
            },
            {
                id: this.nextTaskId++,
                title: 'Buy Groceries',
                description: 'Milk, Eggs, Bread, Vegetables',
                category: 'Shopping',
                priority: 'Medium',
                dueDate: this.getTodayDate(),
                isCompleted: false,
                createdDate: new Date().toISOString()
            },
            {
                id: this.nextTaskId++,
                title: 'Morning Workout',
                description: '30 minutes cardio and stretching',
                category: 'Health',
                priority: 'High',
                dueDate: this.getTodayDate(),
                isCompleted: true,
                createdDate: new Date().toISOString()
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasksToStorage();
    }
    
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }
    
    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    
    showToast(title, message, variant) {
        // In real Salesforce, use ShowToastEvent
        console.log(`${variant.toUpperCase()}: ${title} - ${message}`);
    }
}