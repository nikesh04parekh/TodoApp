//localStorage.removeItem('todoList');

let todo = (function () {
    let data = (localStorage.getItem('todoList')) ? JSON.parse(localStorage.getItem('todoList')) : {
        todo: [],
    };

    renderTodoList();


    function addItem1() {
        const value = document.getElementById('item').value;
        value ? addItem(value) : alert(`Enter a valid to do`);
    }

    function addItem2(e) {
        let value = this.value;
        if ((e.code === 'Enter' || e.code === 'NumpadEnter')) {
            value ? addItem(value) : alert(`Enter a valid to do`);
        }
    }

    document.getElementById('add').addEventListener('click', addItem1);
    document.getElementById('item').addEventListener('keydown', addItem2);
    document.getElementById('deleteAll').addEventListener('click' , deleteAll);

    function checkIfPresent(value){
        return (data.todo.filter((item) => item.value === value)).length;
    }

    function addItem(value) {
        if (checkIfPresent(value))
        {
            alert(`To do with value = ${value} already present`);
            return;
        }
        let id = addItemToDOM(value);
        document.getElementById('item').value = '';
        let temp = {
            value,
            id
        }
        data.todo.push(temp);
        dataObjectUpdated();
    }

    function renderTodoList() {
        if (!data.todo.length) return;
        data.todo.forEach((item) => addItemToDOM(item.value));
    }

    function dataObjectUpdated() {
        localStorage.setItem('todoList', JSON.stringify(data));
    }

    function findIndex(id){
        let index = -1 , i = 0;

        data.todo.forEach((item) => {
            if (item.id == id)
                index = i;
            i += 1;
        });
        return index;
    }
    function removeItem() {
        let item = this.parentNode.parentNode;
        let parent = item.parentNode;
        let value = item.children[0].value;
        let index = findIndex(item.id);
        data.todo.splice(index , 1);
        dataObjectUpdated();
        parent.removeChild(item);
    }

    function getFirstMatchingTagOfCurrentDiv(div, foo) {
        const arr = div.getElementsByTagName('BUTTON');
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].classList.contains(foo)) {
                return arr[i];
            }
        }
    }

    function editItem() {
        let item = this.parentNode.parentNode;
        let listItems = item.parentNode.children;
        //console.log(item , listItems);
        for (let i = 0 ; i < listItems.length ; i++){
            item1 = listItems[i];
            if (item.id != item1.id && getFirstMatchingTagOfCurrentDiv(item1.children[1] , 'edit').style.display === 'none')
                cancelChange(item1.children[1]);
        }
        cancelChange(this.parentNode);
        item.children[0].readOnly = false;
        item.children[0].focus();
    }

    function setDisplayFunctionality(element) {
        element.style.display = (element.style.display === 'block') ? 'none' : 'block';
    }

    function updateItem() {
        let item = this.parentNode.parentNode;
        if (!item.children[0].value) {
            alert('Enter a valid Update to-do');
            return;
        }
        let index = findIndex(item.id);
        data.todo[index].value = item.children[0].value;
        cancelChange(this.parentNode);
        item.children[0].readOnly = true;
        dataObjectUpdated();
    }

    function cancelChange(element) {
        setDisplayFunctionality(getFirstMatchingTagOfCurrentDiv(element, 'cancel'));
        setDisplayFunctionality(getFirstMatchingTagOfCurrentDiv(element, 'update'));
        setDisplayFunctionality(getFirstMatchingTagOfCurrentDiv(element, 'remove'));
        setDisplayFunctionality(getFirstMatchingTagOfCurrentDiv(element, 'edit'));
    }

    function cancelListener() {
        let item = this.parentNode.parentNode;
        let id = item.id;
        let index = findIndex(id);
        item.children[0].value = data.todo[index].value;
        item.children[0].readOnly = true;
        cancelChange(this.parentNode);
    }

    function getMaxId(element) {
        let arr = element.children;
        let j = 0;
        for (let i = 0; i < arr.length; i++)
            j = Math.max(j , Number(arr[i].id));
        return j + 1;
    }

    function updateItem1(e) {
        if (e.key === 'Enter' || e.key === 'NumpadEnter'){
            getFirstMatchingTagOfCurrentDiv(this.parentNode.children[1] , 'update').click();
        }
    }

    function createButton(buttonName , flag){
        let button = document.createElement('button');
        button.classList.add(buttonName);
        if (flag)
            button.style.display = 'block';
        else
            button.style.display = 'none';
        button.innerText = buttonName;
        return button;
    }

    function addItemToDOM(text) {
        let list = document.getElementById('todo');
        let item = document.createElement('li');
        let id = getMaxId(list)
        item.id = "" + id;
        let input = document.createElement('input');
        input.value = text;
        input.readOnly = true;
        input.style.width = '70%';
        input.style.padding = '3px';
        input.style.borderWidth = '0px';
        input.style.outline = 'none';
        input.addEventListener("keydown", updateItem1);

        let buttons = document.createElement('div');
        buttons.classList.add('buttons');

        //Remove Button functionality
        let remove = createButton('remove' , true);
        remove.addEventListener('click', removeItem);

        //Update Button functionality
        let update = createButton('update' , false);
        update.addEventListener('click', updateItem);

        //Cancel Button functionality
        let cancel = createButton('cancel' , false);
        cancel.addEventListener('click', cancelListener);

        //Edit Button Functionality
        let edit = createButton('edit' , true);
        edit.addEventListener('click', editItem);

        //Appending buttons to li of ul
        buttons.appendChild(edit);
        buttons.appendChild(update);
        buttons.appendChild(remove);
        buttons.appendChild(cancel);
        item.appendChild(input);
        item.appendChild(buttons);

        list.insertBefore(item, list.childNodes[0]);
        return id;
    }

    function deleteAll() {
        let list = document.getElementById('todo');
        let arr = list.children;
        if (arr.length === 0){
            alert(`No to do's found`);
            return;
        }
        while (arr.length) {
            getFirstMatchingTagOfCurrentDiv(arr[0].children[1] , 'remove').click();
        }
    }
})();