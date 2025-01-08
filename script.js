class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || {};
        this.currentHabit = localStorage.getItem('currentHabit') || null;
        this.migrateData();
        this.init();
    }

    migrateData() {
        Object.keys(this.habits).forEach(habitName => {
            if (!this.habits[habitName].dates) {
                const oldData = {...this.habits[habitName]};
                this.habits[habitName] = {
                    dates: oldData
                };
            }
        });
        this.saveHabits();
    }

    init() {
        this.setupHabitControls();
        this.renderHabitList();
        this.setupEventListeners();
        this.createGrid();
    }

    setupHabitControls() {
        const addButton = document.getElementById('addHabit');
        const input = document.getElementById('newHabitInput');

        addButton.addEventListener('click', () => {
            const habitName = input.value.trim();
            if (habitName) {
                this.addHabit(habitName);
                input.value = '';
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const habitName = input.value.trim();
                if (habitName) {
                    this.addHabit(habitName);
                    input.value = '';
                }
            }
        });
    }

    addHabit(name) {
        if (!this.habits[name]) {
            this.habits[name] = {
                dates: {}
            };
            this.saveHabits();
            this.renderHabitList();
            this.setCurrentHabit(name);
        }
    }

    renderHabitList() {
        const habitList = document.getElementById('habitList');
        habitList.innerHTML = '';
        
        Object.keys(this.habits).forEach(habitName => {
            const habitElement = document.createElement('div');
            habitElement.className = 'habit-item';
            if (habitName === this.currentHabit) {
                habitElement.classList.add('active');
            }

            // Create habit name element
            const nameElement = document.createElement('span');
            nameElement.className = 'habit-name';
            nameElement.textContent = habitName;
            nameElement.addEventListener('click', () => {
                this.setCurrentHabit(habitName);
            });
            
            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-habit';
            deleteButton.innerHTML = '×';
            deleteButton.title = 'Delete habit';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${habitName}"?`)) {
                    this.deleteHabit(habitName);
                }
            });
            
            habitElement.appendChild(nameElement);
            habitElement.appendChild(deleteButton);
            habitList.appendChild(habitElement);
        });
    }

    setCurrentHabit(habitName) {
        this.currentHabit = habitName;
        localStorage.setItem('currentHabit', habitName);
        document.getElementById('currentHabit').textContent = habitName;
        this.renderHabitList();
        this.createGrid();
        this.updateStats();
    }

    createGrid() {
        const grid = document.getElementById('habitGrid');
        grid.innerHTML = '';
        
        if (!this.currentHabit) return;

        const today = new Date();
        const year = today.getFullYear();
        
        const startDate = new Date(year, 0, 1);
        const startOffset = startDate.getDay();
        
        for (let week = 0; week < 53; week++) {
            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('div');
                cell.className = 'habit-cell';
                
                const dayOffset = week * 7 + day - startOffset;
                const date = new Date(year, 0, dayOffset + 1);
                
                if (date.getFullYear() === year) {
                    const dateString = date.toISOString().split('T')[0];
                    cell.dataset.date = dateString;
                    
                    if (this.habits[this.currentHabit].dates[dateString]) {
                        cell.classList.add('active');
                    }
                }
                
                grid.appendChild(cell);
            }
        }
    }

    toggleDate(cell) {
        if (!this.currentHabit) return;
        
        const date = cell.dataset.date;
        cell.classList.toggle('active');
        
        if (cell.classList.contains('active')) {
            this.habits[this.currentHabit].dates[date] = true;
        } else {
            delete this.habits[this.currentHabit].dates[date];
        }
        
        this.saveHabits();
        this.updateStats();
    }

    updateStats() {
        if (!this.currentHabit) {
            document.getElementById('totalDays').textContent = '0';
            document.getElementById('currentStreak').textContent = '0';
            return;
        }

        const totalDays = Object.keys(this.habits[this.currentHabit].dates).length;
        document.getElementById('totalDays').textContent = totalDays;

        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
            const dateString = currentDate.toISOString().split('T')[0];
            if (!this.habits[this.currentHabit].dates[dateString]) {
                break;
            }
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        document.getElementById('currentStreak').textContent = streak;
    }

    setupEventListeners() {
        const grid = document.getElementById('habitGrid');
        grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('habit-cell')) {
                this.toggleDate(e.target);
            }
        });

        document.getElementById('toggleToday').addEventListener('click', () => {
            if (!this.currentHabit) return;
            
            const today = new Date().toISOString().split('T')[0];
            const todayCell = document.querySelector(`[data-date="${today}"]`);
            if (todayCell) {
                this.toggleDate(todayCell);
            }
        });
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    deleteHabit(habitName) {
        delete this.habits[habitName];
        this.saveHabits();
        
        // If the deleted habit was selected, clear the current selection
        if (this.currentHabit === habitName) {
            this.currentHabit = null;
            localStorage.removeItem('currentHabit');
            document.getElementById('currentHabit').textContent = 'Select a habit';
            this.createGrid();
            this.updateStats();
        }
        
        this.renderHabitList();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
}); 