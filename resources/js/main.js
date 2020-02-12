let todo = (function () {
    let data = (localStorage.getItem('todoList')) ? JSON.parse(localStorage.getItem('todoList')) : {
        todo: [],
    };

    renderTodoList();


    function addItem1() {
        const value = document.getElementById('item').value;
        if (value) {
            addItem(value);
        }
        else{
            alert(`Enter a valid to do`);
        }
    }

    function addItem2(e) {
        let value = this.value;
        if ((e.code === 'Enter' || e.code === 'NumpadEnter')) {
            if (value) {
                addItem(value);
            }
            else {
                alert(`Enter a valid to do`);
            }
        }
    }

    // User clicked on the add button
    // If there is any text inside the item field, add that text to the todo list
    document.getElementById('add').addEventListener('click', addItem1);

    document.getElementById('item').addEventListener('keydown', addItem2);

    document.getElementById('deleteAll').addEventListener('click' , deleteAll);

    function addItem(value) {
        addItemToDOM(value);
        document.getElementById('item').value = '';

        data.todo.push(value);
        dataObjectUpdated();
    }

    function renderTodoList() {
        if (!data.todo.length) return;

        for (let i = 0; i < data.todo.length; i++) {
            let value = data.todo[i];
            addItemToDOM(value);
        }
    }

    function dataObjectUpdated() {
        localStorage.setItem('todoList', JSON.stringify(data));
    }

    function removeItem() {
        //console.log(this);
        let item = this.parentNode.parentNode;
        let parent = item.parentNode;
        let value = item.children[0].value;
        data.todo.splice(data.todo.indexOf(value), 1);
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
        cancelChange(this.parentNode);
        item.children[0].readOnly = false;
        item.children[0].focus();
        //parent.removeChild(item);
    }

    function setDisplayFunctionality(element) {
        if (element.style.display === "block")
            element.style.display = "none";
        else {
            element.style.display = "block";
        }

    }

    function updateItem() {
        let item = this.parentNode.parentNode;
        //console.log(item);
        if (!item.children[0].value) {
            alert('Enter a valid Update to-do');
            return;
        }
        data.todo[Number(item.id) - 1] = item.children[0].value;
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
        cancelChange(this.parentNode);
    }

    function getMaxId(element) {
        let arr = element.children;
        let j = 0;
        for (let i = 0; i < arr.length; i++) {
            //console.log(Number(arr[i].id));
            if (Number(arr[i].id) > j)
                j = Number(arr[i].id);
        }
        return j + 1;
    }

    function updateItem1(e) {
        //console.log(this);
        if (e.key === 'Enter' || e.key === 'NumpadEnter'){
            getFirstMatchingTagOfCurrentDiv(this.parentNode.children[1] , 'update').click();
        }
    }

    // Adds a new item to the todo list
    function addItemToDOM(text) {
        let list = document.getElementById('todo');

        let item = document.createElement('li');
        item.id = "" + getMaxId(list);


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
        let remove = document.createElement('button');
        remove.classList.add('remove');
        remove.innerText = 'Remove';
        remove.style.display = 'block';
        remove.classList.add('button1');

        // Add click event for removing the item
        remove.addEventListener('click', removeItem);


        //Update Button functionality
        let update = document.createElement('button');
        update.classList.add('update');
        update.innerText = 'Update';

        update.addEventListener('click', updateItem);
        update.style.display = 'none';


        //Cancel Button functionality
        let cancel = document.createElement('button');
        cancel.classList.add('cancel');
        cancel.innerText = 'Cancel';

        cancel.addEventListener('click', cancelListener);
        cancel.style.display = 'none';

        //Edit Button Functionality
        let edit = document.createElement('button');
        edit.classList.add('edit');
        edit.innerText = 'Edit';
        edit.style.display = 'block';

        // Add click event for completing the item
        edit.addEventListener('click', editItem);


        buttons.appendChild(edit);
        buttons.appendChild(update);
        buttons.appendChild(remove);
        buttons.appendChild(cancel);
        item.appendChild(input);
        item.appendChild(buttons);

        list.insertBefore(item, list.childNodes[0]);
    }

    function deleteAll() {
        let list = document.getElementById('todo');
        let arr = list.children;
        //console.log(arr[0].children[1]);
        if (arr.length === 0){
            alert(`No to do's found`);
            return;
        }
        while (arr.length) {
            getFirstMatchingTagOfCurrentDiv(arr[0].children[1] , 'remove').click();
        }
    }
})();