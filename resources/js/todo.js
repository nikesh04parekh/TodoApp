//localStorage.removeItem('todoList');

const model = (function(){
    let data = JSON.parse(localStorage.getItem('todoList')) || {
                        todo: [],
    }

    function _commit(){
        localStorage.setItem('todoList' , JSON.stringify(data));
    }

    function addTodoItem(todoValue){
        if (checkIfPresent(todoValue))
            return -1;
        const todo = {
            id : data.todo.length > 0 ? data.todo[data.todo.length - 1].id + 1 : 1,
            value : todoValue,
            completed : false
        }
        data.todo.push(todo);
        _commit();
        return todo.id;
    }

    function deleteTodoItem(id){
        data.todo = data.todo.filter((todo) => todo.id != id);
        _commit();
    }

    function updateTodoItem(id , todoValue){
        data.todo = data.todo.map((todo) => (todo.id == id ? {id : todo.id , value : todoValue , completed : todo.completed} : todo));
        _commit();
    }

    function getValueOfCurrentTodo(id){
        return data.todo.filter((todo) => todo.id == id)[0].value;
    }

    function getTodoList(){
        return data.todo;
    }

    function checkIfPresent(todoValue){
        const arr = (data.todo.filter((todo) => todo.value === todoValue));
        return (arr.length !== 0);
    }

    function toggleCompleted(id){
        data.todo = data.todo.map((todo) => todo.id == id ? {id : todo.id , value : todo.value , completed : !todo.completed} : todo);
        _commit();
    }

    return{
        addTodoItem,
        deleteTodoItem,
        updateTodoItem,
        getTodoList,
        checkIfPresent,
        getValueOfCurrentTodo,
        toggleCompleted,
        markAll,
        unmarkAll
    }
}());

const view = (function(){
    const input = getElement('#item');
    const todoListUl = getElement('#todo');
    function getElement(selector){
        return document.querySelector(selector);
    }

    function resetTodoText(){
        input.value = '';
    }

    function createElement(tag , classList){
        const element = document.createElement(tag);
        element.classList.add(...classList);
        return element;
    }

    function bindDeleteTodo(handler){
        todoListUl.addEventListener('click' , function(event){
            if (event.target.classList.contains('remove')){
                let li = findClosestParent(event.target , 'li');
                //console.log(Array.of(...todoListUl.children).indexOf(li) , Array.prototype.indexOf.apply(todoListUl.childNodes , [li]));
                todoListUl.removeChild(li);
                handler(li.id);
            }
        });
    }

    function bindEditTodo(){
        todoListUl.addEventListener('click' , function(event){
            if (event.target.classList.contains('edit')){
                const li = findClosestParent(event.target , 'li');
                const input = findFirstChild(li , 'input');
                if (input.style.textDecoration === 'line-through'){
                    alert('Cannot edit to do');
                    return;
                }
                setToDefaultView();
                cancelChange(event.target);
                updateInputProperty(event.target);
            }
        });
    }

    function bindCancel(handler){
        todoListUl.addEventListener('click' , function(event){
            if (event.target.classList.contains('cancel')){
                let li = findClosestParent(event.target , 'li');
                let input = findFirstChild(li , 'input');
                input.value = handler(li.id);
                cancelChange(event.target);
                updateInputProperty(event.target);
            }
        });
    }

    function bindUpdateTodo(handler){
        todoListUl.addEventListener('click' , function(event){
            if (event.target.classList.contains('update')){
                let li = findClosestParent(event.target , 'li');
                let input = findFirstChild(li , 'input');
                if (input.value === ''){
                    alert('Enter a valid to do');
                    return;
                }
                updateInputProperty(event.target);
                const status = handler(li.id , input.value);
                if (status == -1)
                    return;
                cancelChange(event.target);
            }
        });
    }

    function bindAddTodo(handler){
        document.getElementById('add').addEventListener('click' , function(){
            if (input.value === ''){
                alert('Enter a valid to do');
                return;
            }
            const todoValue = input.value;
            const status = handler(todoValue);
            input.value = '';
            if (status == -1){
                alert(`Todo with value = ${todoValue} already exists.`);
                return;
            }
            const todo = {
                id : status,
                value : todoValue,
                completed : false
            };
            addItemToDom(todo);
            focusInputTag();
        });
    }

    function bindAddTodoViaEnterKey(){
        input.addEventListener('keydown' , function(event){
            if ((event.key === 'Enter' || event.key === 'NumpadEnter') && event.target.id === 'item')
                document.getElementById('add').click();
        });
    }

    function bindDeleteAllTodo(){
        document.getElementById('deleteAll').addEventListener('click' , function(event) {
            let arr = todoListUl.children;
            while(arr.length){
                findFirstChild(arr[0] , 'remove').click();
            }
        });
    }

    function bindUpdateTodoViaEnterKey(){
        todoListUl.addEventListener('keydown' , function(event){
            if ((event.key === 'Enter' || event.key === 'NumpadEnter') && event.target.classList.contains('input')){
                let li = findClosestParent(event.target , 'li');
                findFirstChild(li , 'update').click();
            }
        });
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

    function displayAllTodo(handler){
        todoList = handler();
        if (!todoList.length)
            return;
        let fragment = new DocumentFragment();
        todoList.forEach((todo) => {
            fragment.append(addItemToDom(todo));
        });
        todoListUl.append(fragment);
    }

    function bindToggleCheckedValue(handler){
        todoListUl.addEventListener('change' , function(event){
            if (event.target.classList.contains('checkbox')){
                let li = findClosestParent(event.target , 'li');
                const input = findFirstChild(li , 'input');
                if (input.style.textDecoration === 'none')
                    input.style.textDecoration = 'line-through';
                else
                    input.style.textDecoration = 'none';
                event.target.style.checked = !event.target.style.checked;
                handler(findClosestParent(event.target , 'li').id);
            }
        });
    }

    function bindDeleteMarkedAllTodo(){
        document.getElementById('deleteMarkedAll').addEventListener('click' , function(event){
            const arr = todoListUl.children;
            let i = 0;
            while(i < arr.length){
                if (findFirstChild(arr[i] , 'input').style.textDecoration === 'line-through'){
                    findFirstChild(arr[i] , 'remove').click();
                }
                else
                    i += 1;
            }
        });
    }

    function bindMarkAllTodo(){
        document.getElementById('markAll').addEventListener('click' , function(event){
            const arr = todoListUl.children;
            let i = 0;
            while(i < arr.length){
                if (findFirstChild(arr[i] , 'input').style.textDecoration === 'none'){
                    findFirstChild(arr[i] , 'checkbox').click();
                }
                i += 1;
            }
        });
    }

    function bindUnmarkAllTodo(){
        document.getElementById('unmarkAll').addEventListener('click' , function(event){
            const arr = todoListUl.children;
            let i = 0;
            while(i < arr.length){
                if (findFirstChild(arr[i] , 'input').style.textDecoration === 'line-through'){
                    findFirstChild(arr[i] , 'checkbox').click();
                }
                i += 1;
            }
        });

    }

    function focusInputTag(){
        input.focus();
    }

    function setDate(){
        document.getElementById('date').innerText = (new Date()).toDateString();
    }

    function addItemToDom(todo){
        const li = createElement('li' , ['li']);
        li.id = todo.id;
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
        //todoListUl.insertBefore(li , todoListUl.children[0]);
        resetTodoText();
        return li;
    }

    function cancelChange(that){
        toggleDisplayValue(findFirstChild(findClosestParent(that , 'li') , 'edit'));
        toggleDisplayValue(findFirstChild(findClosestParent(that , 'li') , 'update'));
        toggleDisplayValue(findFirstChild(findClosestParent(that , 'li') , 'cancel'));
        toggleDisplayValue(findFirstChild(findClosestParent(that , 'li') , 'remove'));
    }

    function setToDefaultView(){
        let listItems = todoListUl.children;
        for (let i = 0 ; i < listItems.length ; i++){
            if (findFirstChild(listItems[i] , 'edit').style.display === 'none')
                cancelChange(listItems[i]);
        }
    }

    function toggleDisplayValue(that){
        that.style.display = that.style.display === 'block' ? 'none' : 'block';
    }

    function updateInputProperty(that){
        let element = findFirstChild(findClosestParent(that , 'li') , 'input');
        element.readOnly = !element.readOnly;
        if (!element.readOnly)
            element.focus();
    }

    function findClosestParent(that , className){
        if (that.tagName === 'BODY')
            return null;
        if (that.classList.contains(className))
            return that;
        return findClosestParent(that.parentNode , className);
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

    return{
        displayAllTodo,
        bindDeleteTodo,
        bindEditTodo,
        bindCancel,
        bindUpdateTodo,
        bindAddTodo,
        bindAddTodoViaEnterKey,
        bindDeleteAllTodo,
        bindUpdateTodoViaEnterKey,
        bindToggleCheckedValue,
        bindMarkAllTodo,
        bindUnmarkAllTodo,
        bindDeleteMarkedAllTodo,
        focusInputTag,
        setDate
    };
}());

const controller = (function(){

    window.onLoad = function() {
        view.focusInputTag();
        view.setDate();
     }();
    view.bindDeleteTodo(handleDeleteTodo);
    view.bindEditTodo();
    view.bindCancel(handleCancel);
    view.bindUpdateTodo(handleUpdateTodo);
    view.bindAddTodo(handleAddTodo);
    view.bindAddTodoViaEnterKey();
    view.bindDeleteAllTodo();
    view.bindUpdateTodoViaEnterKey();
    view.displayAllTodo(model.getTodoList);
    view.bindToggleCheckedValue(handleToggleCheckedValue);
    view.bindMarkAllTodo();
    view.bindUnmarkAllTodo();
    view.bindDeleteMarkedAllTodo();

    function handleDeleteTodo(id){
        model.deleteTodoItem(id);
    }

    function handleCancel(id){
        return model.getValueOfCurrentTodo(id);
    }

    function deleteAll(){
        let arr = view.getTodoUlList().children;
        while(arr.length){
            view.findFirstChild(arr[0] , 'remove').click();
        }
    }

    function handleUpdateTodo(id , value){
        if (model.checkIfPresent(value)){
            alert(`To do with value = ${value} already exists.`);
            return -1;
        }
        model.updateTodoItem(id , value);
        return 0;
    }

    function handleAddTodo(todoValue){
        return model.addTodoItem(todoValue);
    }

    function handleDeleteAllTodo(id){
        model.deleteTodoItem(id);
    }

    function handleToggleCheckedValue(id){
        model.toggleCompleted(id);
    }

    function addViaEnterKey(e){
        if (e.key === 'Enter' || e.key === 'NumpadEnter'){
            view.bindAddTodo(handleAddTodo);
        }
    }

    function updateViaEnter(e){
        if (e.key === 'Enter' || e.key === 'NumpadEnter')
           view.findFirstChild(e.target.parentNode , 'update').click();
    }

}());

