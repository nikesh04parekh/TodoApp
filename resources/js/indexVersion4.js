const Model = function(){

    this.data = JSON.parse(localStorage.getItem('todoList')) || {
                        todo: [],
    }

    Model.prototype._commit = function(){
        localStorage.setItem('todoList' , JSON.stringify(this.data));
    }.bind(this);

    Model.prototype.addTodoItem = function(todoValue){
        if (this.checkIfPresent(todoValue))
            return -1;
        const todo = {
            value : todoValue,
            completed : false
        }
        this.data.todo.push(todo);
        this._commit();
        return todo.id;
    }.bind(this);

    Model.prototype.deleteTodoItem = function(id){
        this.data.todo.splice(id , 1);
        this._commit();
    }.bind(this);

    Model.prototype.updateTodoItem = function(id , todoValue){
        this.data.todo[id].value = todoValue;
        this._commit();
    }.bind(this);

    Model.prototype.getValueOfCurrentTodo = function(id){
        return this.data.todo[id].value;
    }.bind(this);

    Model.prototype.getTodoList = function(){
        return this.data.todo;
    }.bind(this);

    Model.prototype.checkIfPresent = function(todoValue){
        const arr = (this.data.todo.filter(function(todo) {
            return (todo.value === todoValue)
        }));
        return (arr.length !== 0);
    }.bind(this);

    Model.prototype.toggleCompleted = function(id){
        this.data.todo[id].completed = !this.data.todo[id].completed;
        this._commit();
    }.bind(this);
}

const helper = (function(){
    function findClosestParent(that , className){
        if (that.tagName === 'BODY')
            return null;
        if (that.classList.contains(className))
            return that;
        return findClosestParent(that.parentNode , className);
    }

    function createButtonsForLi(tag , classList , flagForDisplay , buttonName){
        let element = createElement(tag  , classList);
        element.innerText = buttonName;
        element.classList.add(buttonName);
        if(flagForDisplay)
            element.style.display = 'block';
        else
            element.style.display = 'none';
        return element;
    }

    function findFirstChild(that , className){
        let arr = [];
        arr.push(that);
        let flag = false;
        let ans;
        while(arr.length){
            let element = arr[0];
            arr.splice(0 , 1);
            for (let i = 0 ; i < element.children.length ; i++){
                arr.push(element.children[i]);
                if (element.children[i].classList.contains(className)){
                    ans = element.children[i];
                    flag = !flag;
                    break;
                }
            }
            if (flag)
                break;
        }
        return ans;
    }

    function createElement(tag , classList){
        const element = document.createElement(tag);
        element.classList.add(...classList);
        return element;
    }

    function createListElement(todo){
        const li = createElement('li' , ['li']);
        const input = createElement('input' , ['input']);
        input.value = todo.value;
        input.readOnly = true;
        input.style.width = '70%';
        input.style.padding = '3px';
        input.style.borderWidth = '0px';
        input.style.outline = 'none';
        input.style.textDecoration = 'none';
        let checkbox = createElement('input' , ['checkbox']);
        checkbox.style.marginRight = '5px';
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        if (todo.completed)
            input.style.textDecoration = 'line-through';
        let remove = createButtonsForLi('button' , [] ,  true , 'remove');
        let edit = createButtonsForLi('button' , [] , true , 'edit');
        let cancel = createButtonsForLi('button' , [] , false , 'cancel');
        let update = createButtonsForLi('button' , [] , false , 'update');
        let divForButtons = createElement('div' , ['buttons']);
        divForButtons.append(edit);
        divForButtons.append(update);
        divForButtons.append(cancel);
        divForButtons.append(remove);
        li.append(checkbox);
        li.append(input);
        li.append(divForButtons);
        return li;
    }

    return{
        createElement,
        findFirstChild,
        findClosestParent,
        createButtonsForLi,
        createListElement
    }

}());

const HeaderView = function() {
    this.init = function(modelFunctionsRequired , listFunctionsRequired){
        this.element = document.querySelector('header');
        this.inputElement = document.querySelector('.item');
        this.buttonElement = document.querySelector('.add');
        this.modelFunctionsRequired = modelFunctionsRequired;
        this.listFunctionsRequired = listFunctionsRequired;

        this.buttonElement.addEventListener('click' , function() {
            const todoValue = this.inputElement.value;
            if (todoValue === ''){
                alert('Enter a valid to do');
                return;
            }
            const status = this.modelFunctionsRequired.handleAddTodo(todoValue);
            this.inputElement.value = "";
            if (status == -1){
                alert(`Todo with value = ${todoValue} already exists.`);
                return;
            }
            const todo = {
                value : todoValue,
                completed : false
            };
            const listItem = helper.createListElement(todo);
            this.listFunctionsRequired.addTodo(listItem);
            this.focusInputTag();
        }.bind(this));

        HeaderView.prototype.resetTodoText = function(){
            this.inputElement.setValue('');
        }

        this.inputElement.addEventListener('keydown' , function(event) {
            if ((event.key === 'Enter' || event.key === 'NumpadEnter') && event.target.classList.contains('item'))
                document.getElementsByClassName('add')[0].click();
        });

        HeaderView.prototype.focusInputTag = function(){
            this.inputElement.focus();
        }
    }

    this.destroy = function(){
        delete this.inputElement;
        delete this.buttonElement
    }
}

const TodoListView = function() {

    this.init = function(modelFunctionsRequired){
        this.element = helper.createElement('ul' , ['todoList' , 'todo']);
        this.modelFunctionsRequired = modelFunctionsRequired;
        const todoList = this.modelFunctionsRequired.getTodoList();

        if (todoList.length){
            let fragment = new DocumentFragment();
            todoList.forEach(function(todo)  {
                fragment.append(helper.createListElement(todo));
            });
            this.element.append(fragment);
        }


        this.element.addEventListener('click' , function(event){
            if (event.target.classList.contains('remove')){
                const li = helper.findClosestParent(event.target , 'li');
                const id = (Array.of(...(this.element.children))).indexOf(li);
                this.element.removeChild(li);
                this.modelFunctionsRequired.handleDeleteTodo(id);
            }
        }.bind(this));

        this.element.addEventListener('click' , function(event) {
            if (event.target.classList.contains('edit')){
                const li = helper.findClosestParent(event.target , 'li');
                const input = helper.findFirstChild(li , 'input');
                if (input.style.textDecoration === 'line-through'){
                    alert('Cannot edit to do');
                    return;
                }
                this.setToDefaultView();
                this.cancelChange(event.target);
                this.updateInputProperty(event.target);
            }
        }.bind(this));

        this.element.addEventListener('click' , function(event) {
            if (event.target.classList.contains('cancel')){
                const li = helper.findClosestParent(event.target , 'li');
                const input = helper.findFirstChild(li , 'input');
                const todoListUl = helper.findClosestParent(li , 'todo');
                const id = (Array.of(...(todoListUl.children))).indexOf(li);
                input.value = this.modelFunctionsRequired.handleCancel(id);
                this.cancelChange(event.target);
                this.updateInputProperty(event.target);
            }
        }.bind(this));

        this.element.addEventListener('click' , function(event) {
            if (event.target.classList.contains('update')){
                const li = helper.findClosestParent(event.target , 'li');
                const input = helper.findFirstChild(li , 'input');
                const todoListUl = helper.findClosestParent(li , 'todo');
                if (input.value === '')
                {
                    alert('Enter a valid to do');
                    return;
                }

                const id = (Array.of(...(this.element.children))).indexOf(li);
                const status = this.modelFunctionsRequired.handleUpdateTodo(id , input.value);
                if (status == -1){
                    return;
                }
                this.updateInputProperty(event.target);
                this.cancelChange(event.target);
            }
        }.bind(this));

        this.element.addEventListener('keydown' , function(event){
            if ((event.key === 'Enter' || event.key === 'NumpadEnter') && event.target.classList.contains('input')){
                const li = helper.findClosestParent(event.target , 'li');
                helper.findFirstChild(li , 'update').click();
            }
        }.bind(this));

        this.element.addEventListener('change' , function(event) {
            if (event.target.classList.contains('checkbox')){
                const li = helper.findClosestParent(event.target , 'li');
                const input = helper.findFirstChild(li , 'input');
                const todoListUl = helper.findClosestParent(li , 'todo');
                if (input.style.textDecoration === 'none')
                    input.style.textDecoration = 'line-through';
                else
                    input.style.textDecoration = 'none';
                event.target.style.checked = !event.target.style.checked;
                const id = (Array.of(...(todoListUl.children))).indexOf(li);
                this.modelFunctionsRequired.handleToggleCheckedValue(id);
            }
        }.bind(this));

        TodoListView.prototype.cancelChange = function (that){
            this.toggleDisplayValue(helper.findFirstChild(helper.findClosestParent(that , 'li') , 'edit'));
            this.toggleDisplayValue(helper.findFirstChild(helper.findClosestParent(that , 'li') , 'update'));
            this.toggleDisplayValue(helper.findFirstChild(helper.findClosestParent(that , 'li') , 'cancel'));
            this.toggleDisplayValue(helper.findFirstChild(helper.findClosestParent(that , 'li') , 'remove'));
        }.bind(this);

        TodoListView.prototype.setToDefaultView = function(){
            let listItems = this.element.children;
            for (let i = 0 ; i < listItems.length ; i++){
                if (helper.findFirstChild(listItems[i] , 'edit').style.display === 'none'){
                    helper.findFirstChild(listItems[i] , 'input').value = this.modelFunctionsRequired.getValueOfCurrentListItem(i);
                    this.cancelChange(listItems[i]);
                    this.updateInputProperty(listItems[i]);
                }
            }
        }.bind(this);

         TodoListView.prototype.updateInputProperty = function(that){
            let element = helper.findFirstChild(helper.findClosestParent(that , 'li') , 'input');
            element.readOnly = !element.readOnly;
            if (!element.readOnly)
                element.focus();
        }

        TodoListView.prototype.toggleDisplayValue = function(that){
            that.style.display = that.style.display === 'block' ? 'none' : 'block';
        }

        TodoListView.prototype.markAllTodos = function(){
            const todoListUl = this.element;
            const todoArray = todoListUl.children;
            let i = 0;
            while(i < todoArray.length){
                const checkedValue = helper.findFirstChild(todoArray[i] , 'checkbox').checked;
                if (!checkedValue)
                    helper.findFirstChild(todoArray[i] , 'checkbox').click();
                i += 1;
            }
        }.bind(this);

        TodoListView.prototype.unmarkAllTodos = function(){
            const todoListUl = this.element;
            const todoArray = todoListUl.children;
            let i = 0;
            while(i < todoArray.length){
                const checkedValue = helper.findFirstChild(todoArray[i] , 'checkbox').checked;
                if (checkedValue)
                    helper.findFirstChild(todoArray[i] , 'checkbox').click();
                i += 1;
            }
        }.bind(this);

        TodoListView.prototype.deleteAllTodos = function(){
            const todoListUl = this.element;
            const todoArray = todoListUl.children;
            while(todoArray.length){
                helper.findFirstChild(todoArray[0] , 'remove').click();
            }
        }.bind(this);

        TodoListView.prototype.deleteMarkedTodos = function(){
            const todoListUl = this.element;
            const todoArray = todoListUl.children;
            let i = 0;
            while(i < todoArray.length){
                const checkedValue = helper.findFirstChild(todoArray[i] , 'checkbox').checked;
                if (checkedValue)
                    helper.findFirstChild(todoArray[i] , 'remove').click();
                else
                    i++;
            }
        }.bind(this);

        TodoListView.prototype.addTodo = function(todoLi){
            this.element.insertBefore(todoLi , this.element.children[0]);
        }.bind(this);
    }

    this.render = function(){
        return this.element;
    }

    this.destroy = function(){
        delete this.element;
    }
}

const ActionBarView = function() {
    this.init = function(modelFunctionsRequired , listFunctionsRequired){
        this.element = helper.createElement('div' , []);
        this.deleteAllButton = helper.createElement('button' , ['button3' , 'deleteAll']);
        this.deleteAllButton.innerText = 'Delete All';
        this.deleteMarkedButton = helper.createElement('button' , ['button3' , 'deleteMarked']);
        this.deleteMarkedButton.innerText = 'Delete Marked';
        this.markAllButton = helper.createElement('button' , ['button3' , 'markAll']);
        this.markAllButton.innerText = 'Mark All';
        this.unmarkAllButton = helper.createElement('button' , ['button3' , 'unmarkAll']);
        this.unmarkAllButton.innerText = 'Unmark All';
        this.modelFunctionsRequired = modelFunctionsRequired;
        this.listFunctionsRequired = listFunctionsRequired;

        this.deleteAllButton.addEventListener('click' , function(event) {
            this.listFunctionsRequired.deleteAllTodos();
        }.bind(this));

        this.markAllButton.addEventListener('click' , function(event){
             this.listFunctionsRequired.markAllTodos();
        }.bind(this));

        this.unmarkAllButton.addEventListener('click' , function(event) {
            this.listFunctionsRequired.unmarkAllTodos();
        }.bind(this));

        this.deleteMarkedButton.addEventListener('click' , function(event) {
            this.listFunctionsRequired.deleteMarkedTodos();
        }.bind(this));
    }

    this.render = function(){
        let fragment = new DocumentFragment();
        this.element.append(this.deleteAllButton);
        this.element.append(this.deleteMarkedButton);
        this.element.append(this.markAllButton);
        this.element.append(this.unmarkAllButton);
        fragment.append(this.element);
        return fragment;
    }

    this.destroy = function(){
        delete this.deleteAllButton;

        delete this.markAllButton;
        delete this.unmarkAllButton;
        delete this.deleteMarkedButton;
    }.bind(this);
}

const AppView = function(model) {

    this.model = model;

    this.handleUpdateTodo = function(id , value){
        console.log(model.getValueOfCurrentTodo(id));
        if (model.getValueOfCurrentTodo(id) === value)
            return 0;
        if (model.checkIfPresent(value))
        {
            alert(`To do with value = ${value} already exists.`);
            return -1;
        }
        model.updateTodoItem(id , value);
        return 0;
    }

    this.markAllTodos = function(){
        this.todoListView.markAllTodos();
    }.bind(this);

    this.unmarkAllTodos = function(){
        this.todoListView.unmarkAllTodos();
    }.bind(this);

    this.deleteAllTodos = function(){
        this.todoListView.deleteAllTodos();
    }.bind(this);

    this.deleteMarkedTodos = function(){
        this.todoListView.deleteMarkedTodos();
    }.bind(this);

    this.addTodoLi = function(todoLi){
        this.todoListView.addTodo(todoLi);
    }.bind(this);

    const modelFunctionsRequiredForHeaderView = {
            handleAddTodo : model.addTodoItem
    };

    const listViewFunctionsRequiredInHeaderView = {
        addTodo : this.addTodoLi
    };

    const modelFunctionsRequiredForTodoListView = {
        handleDeleteTodo : model.deleteTodoItem,
        handleCancel : model.getValueOfCurrentTodo,
        handleUpdateTodo : this.handleUpdateTodo,
        handleToggleCheckedValue : model.toggleCompleted,
        getTodoList : model.getTodoList,
        getValueOfCurrentListItem : model.getValueOfCurrentTodo
    };
    const modelFunctionsRequiredForActionBarView = {

    };

    const listFunctionsRequiredInActionBarView = {
        markAllTodos : this.markAllTodos,
        unmarkAllTodos : this.unmarkAllTodos,
        deleteAllTodos : this.deleteAllTodos,
        deleteMarkedTodos : this.deleteMarkedTodos
    };

    this.init = function() {
        this.headerView = new HeaderView();
        this.headerView.init(modelFunctionsRequiredForHeaderView , listViewFunctionsRequiredInHeaderView);
        this.todoListView = new TodoListView();
        this.todoListView.init(modelFunctionsRequiredForTodoListView);
        this.actionBarView = new ActionBarView();
        this.actionBarView.init(modelFunctionsRequiredForActionBarView , listFunctionsRequiredInActionBarView);
    }

    this.render = function() {
        let fragment = new DocumentFragment();
        fragment.append(this.todoListView.render());
        fragment.append(this.actionBarView.render());
        return fragment;
    }

    this.destroy = function(){
        this.headerView.destroy();
        delete this.headerView;
        this.todoListView.destroy();
        delete this.todoListView;
        this.actionBarView.destroy();
        delete this.actionBarView;
    }.bind(this);
}

const wrapperAppView = (function(){
    const appView = new AppView(new Model());
    appView.init();
    document.querySelector('.main').append(appView.render());
//    window.close = function(){
//        appView.destroy();
//    }
}());