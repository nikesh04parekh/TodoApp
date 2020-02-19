//localStorage.removeItem('todoList');

const model = (function(){
    let data = JSON.parse(localStorage.getItem('todoList')) || {
                        todo: [],
    }

    function _commit(){
        localStorage.setItem('todoList' , JSON.stringify(data));
    }

    function addTodoItem(todoValue){
            const todo = {
                id : data.todo.length > 0 ? data.todo[data.todo.length - 1].id + 1 : 1,
                value : todoValue
            }
            data.todo.push(todo);
            _commit();
            return todo.item;
    }

    function deleteTodoItem(id){
        let i = 0 , index = -1;
        data.todo.forEach((todo) => {
            if (todo.id == id)
                index = i;
            i += 1;
        })
        data.todo.splice(index , 1);
        _commit();
    }

    function updateTodoItem(id , todoValue){
        data.todo = data.todo.map((todo) => (todo.id == id ? {id : todo.id , value : todoValue} : todo));
        _commit();
    }

    function getValueOfCurrentTodo(id){
        return data.todo.filter((todo) => todo.id == id)[0].value;
    }

    function getTodoList(){
        return data.todo;
    }

    function getMaxId(){
        return data.todo.length > 0 ? data.todo[data.todo.length - 1] : 0;
    }

    function checkIfPresent(todoValue){
        const arr = (data.todo.filter((todo) => todo.value === todoValue));
        return (arr.length !== 0);
    }
    return{
        addTodoItem,
        deleteTodoItem,
        updateTodoItem,
        getTodoList,
        getMaxId,
        checkIfPresent,
        getValueOfCurrentTodo,
    }
}());

const controller = (function(){

    function removeItem(){
        let li = view.findClosestParent(this , 'li');
        let index = view.getId(li);
        model.deleteTodoItem(index);
        li.parentNode.removeChild(li);
    }

    function editItem(){
        view.setToDefaultView();
        view.cancelChange(this);
        view.updateInputProperty(this);
    }

    function cancelListener(){
        let li = view.findClosestParent(this , 'li');
        let input = view.findFirstChild(li , 'input');
        view.setValue(input , model.getValueOfCurrentTodo(view.getId(li)));
        view.cancelChange(this);
        view.updateInputProperty(this);
    }

    function deleteAll(){
        let arr = view.getTodoUlList().children;
        while(arr.length){
            view.findFirstChild(arr[0] , 'remove').click();
        }
    }

    function updateItem(){
        let li = view.findClosestParent(this , 'li');
        let input = view.findFirstChild(li , 'input');
        let id = view.getId(view.findClosestParent(this , 'li'));
        if (view.getValue(li) === ''){
            alert(`Enter a valid to do`);
            return;
        }
        if (model.checkIfPresent(view.getValue(li)))
        {
            alert(`To do with value = ${view.getValue(li)} already exists.`);
            return;
        }
        model.updateTodoItem(id , view.getValue(li));
        view.setValue(view.findClosestParent(this , 'li'));
        view.cancelChange(this);
        view.updateInputProperty(this);
    }

    function normalAdd(){
        const todoValue = view.getTodoText();
        if (todoValue === ''){
            alert('Enter a valid to do');
            return;
        }
        else if (model.checkIfPresent(todoValue)){
            alert(`To do with value = ${todoValue} already present`);
        }
        else{
            const id = model.getMaxId() + 1;
            const todo = {
                id,
                value : todoValue
            };
            model.addTodoItem(todoValue);
            view.addItemToDom(todo);
        }
        view.resetTodoText();
        view.focusInputTag();
    }

    function addViaEnterKey(e){
        if (e.key === 'Enter' || e.key === 'NumpadEnter')
            normalAdd();
    }

    function updateViaEnter(e){
        if (e.key === 'Enter' || e.key === 'NumpadEnter')
           view.findFirstChild(e.target.parentNode , 'update').click();
    }

    return{
        editItem,
        removeItem,
        updateItem,
        cancelListener,
        getTodoList : model.getTodoList,
        normalAdd,
        addViaEnterKey,
        deleteAll,
        updateViaEnter
    }

}());

const view = (function(){
    const input = getElement('#item');
    const todoListUl = getElement('#todo');
    document.getElementById('add').addEventListener('click' , controller.normalAdd);
    document.getElementById('deleteAll').addEventListener('click' , controller.deleteAll);
    input.addEventListener('keydown' , controller.addViaEnterKey);
    function getElement(selector){
        return document.querySelector(selector);
    }

    function getTodoText(){
        return input.value;
    }

    function resetTodoText(){
        input.value = '';
    }

    function getTodoUlList(){
        return todoListUl;
    }

    function createElement(tag , classList){
        const element = document.createElement(tag);
        element.classList.add(...classList);
        return element;
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

    function displayAllTodo(){
        let todoList = controller.getTodoList();
        while(todoListUl.length)
            todoListUl.removeChild(todoListUl.firstChild);
        if (!todoList.length)
            return;
        todoList.forEach((todo) => {
            addItemToDom(todo);
            //todoListUl.append(li);
        });
    }

    function focusInputTag(){
        input.focus();
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
        input.addEventListener('keydown' , controller.updateViaEnter);
        let remove = createButtonsForLi('button' , [] ,  true , 'remove');
        remove.addEventListener('click' , controller.removeItem);
        let edit = createButtonsForLi('button' , [] , true , 'edit');
        edit.addEventListener('click' , controller.editItem);
        let cancel = createButtonsForLi('button' , [] , false , 'cancel');
        cancel.addEventListener('click' , controller.cancelListener);
        let update = createButtonsForLi('button' , [] , false , 'update');
        update.addEventListener('click' , controller.updateItem);
        let divForButtons = createElement('div' , ['buttons']);
        divForButtons.append(edit);
        divForButtons.append(update);
        divForButtons.append(cancel);
        divForButtons.append(remove);
        li.append(input);
        li.append(divForButtons);
        todoListUl.append(li);
        resetTodoText();
    }

    function getId(that){
        return that.id;
    }

    function getValue(that){
        return findFirstChild(that , 'input').value;
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

    function setValue(that , todoValue){
        that.value = todoValue;
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
        setValue,
        getValue,
        getId,
        findFirstChild,
        findClosestParent,
        cancelChange,
        setToDefaultView,
        updateInputProperty,
        getTodoText,
        addItemToDom,
        focusInputTag,
        resetTodoText,
        getTodoUlList
    };
}());

view.displayAllTodo();
