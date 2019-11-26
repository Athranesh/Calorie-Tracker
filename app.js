// Storage Controller

const StorageCtrl = (function(){

    //Public methods

    return{

        storeItem: function(item){

            let items;

            //Check if localstorage has items

            if(localStorage.getItem('items') === null){

                items = [];

                //Push new item
                items.push(item)

                //Set local storage
                localStorage.setItem('items', JSON.stringify(items));

            } else {

                //Get local storage items
                items = JSON.parse(localStorage.getItem('items'))

                //Push new item
                items.push(item);

                //Reset local storage
                localStorage.setItem('items', JSON.stringify(items));
            }
            
        },
        getItemsFromStorage: function(){
            let items;

            if(localStorage.getItem('items') === null){
                items = [];

            } else {
                items = JSON.parse(localStorage.getItem('items'));
            }
            return items;

        },
        updateItemStorage: function(){

            items = ItemCtrl.getItems();

            localStorage.setItem('items', JSON.stringify(items));

        }
    }

})();

//Item Controller

const ItemCtrl = (function (){

    //Item Constructor

    const Item = function( name, calories){
        this.name = name;
        this.calories = calories;
    }

    //Data Structure (State)

    const state = {


        items : StorageCtrl.getItemsFromStorage(),

        currentItem : null,

        totalCalories: 0,

        //Generates uniqe ids for each item.

        idGenerator: function(){

            if (this.items.length > 0){

                this.items.forEach((item,index) => {

                item.id = index.toString();
            })
            }
        }

        }

    state.idGenerator();
    

    //Public Methods of ItemCtrl
    return {
        
        getItems: function(){
            return state.items;
        },

        logState: function(){
            return state;
        },
        addItem: function(item){
            
            const meal = { 
                        name: item.name,
                        calories: item.calories
                        }
            state.items.push(meal);

            //Regenerating unique ids for each item.
            state.idGenerator();

        },
        countCalories: function(){

            state.totalCalories = 0;

            state.items.forEach((item) =>{

                state.totalCalories += item.calories;

            })

            return state.totalCalories;
        },

        //Setting state for editing

        setStateEdit: function(listId){

                state.items.forEach((item) => {

                if (listId === item.id){

                    state.currentItem = item;

                }
            })
        },
        currentItem: function(){

            return state.currentItem;

        },
        updateItem: function() {

            const updatedName = UICtrl.getEditInput().name;

            const updatedCalories = UICtrl.getEditInput().calories;

            state.items.forEach((item) => {

                if(state.currentItem.id === item.id){

                    item.name = updatedName;

                    item.calories = updatedCalories;

                }

            })

            //Redrawing the table and recounting total calories with updated 

            UICtrl.populateItemList(ItemCtrl.getItems());
            UICtrl.setTotalCalories();

        },
        deleteItem: function(id){

            state.items.forEach((item, index)=>{

                if (item.id === id){

                    state.items.splice(index,1);

                }

                //Reseting current item back to null after deletion.

                state.currentItem = null;
            })

            UICtrl.populateItemList(ItemCtrl.getItems());
            UICtrl.setTotalCalories();

        },
        clearAll: function(){

            state.items = [];
            state.currentItem = null;
            state.totalCalories = 0;
        }
    }
})()

//UI Controller

const UICtrl = (function (){

    //DOM Selectors: (Added for ease of use and scalability), By defining it as such inside this function, it is private.
    const UISelectors = {
        itemList: '#item-list',
        addBtn :'.add-btn',
        updateBtn :'.update-btn',
        deleteBtn :'.delete-btn',
        backBtn :'.back-btn',
        clearBtn: '.clear-btn',
        itemCalories: '#item-calories',
        itemName: '#item-name',
        totalCalories: '.total-calories'
    }

    //Public Methods
    return {

        populateItemList: function(items){

            let html = '';

            items.forEach(function(item){
                html += `<li class="collection-item" id="${item.id}">
                <strong>${item.name}: </strong> <em> ${item.calories} Calories </em>
                <a href="#" class="secondary-content">
                    <i class="edit-item fa fa-pencil"></i>
                </a>
            </li>`
            })

            document.querySelector(UISelectors.itemList).innerHTML = html;
        },

        //Makes UISelectors public.
        getUISelectors: function(){
            return UISelectors;
        },

        getItemInput: function(){

            //Getting input values

            const itemName = document.querySelector(UISelectors.itemName).value;

            const itemCaloriesInput = document.querySelector(UISelectors.itemCalories).value;


            //Checking if fields are filled:
            if (itemName !== '' && itemCaloriesInput!==''){

                //Returning a meal object made by the values entered by user.

                let meal = {};

                meal.name = itemName;
                const itemCalories = parseInt(itemCaloriesInput);
                meal.calories = itemCalories;

                return meal
            }
             
        },
        getEditInput: function(){

            //Getting input values

            const itemName = document.querySelector(UISelectors.itemName).value;

            const itemCaloriesInput = document.querySelector(UISelectors.itemCalories).value;

            let editedMeal = {};

            //In here 2 individual ifs are used because if the user does not edit either name or calorie, the value will be undefined and will either itemName and/or itemCaloriesInput will be set as undefined. To prevent console errors, below if checks are needed.

            if (itemName){

                editedMeal.name = itemName;

            } else{

                editedMeal.name = ItemCtrl.currentItem().name;

            }

            if (itemCaloriesInput){

                const itemCalories = parseInt(itemCaloriesInput);
                editedMeal.calories = itemCalories;

            }else{

                editedMeal.calories = ItemCtrl.currentItem().calories;
            }

            return editedMeal;   
        },

        deleteMeal: function(id){

            ItemCtrl.deleteItem(id);
            this.clearEditState();
            this.clearInput();

        },

            //Clear input

        clearInput: function(){

            document.querySelector(UISelectors.itemName).value = '';

            document.querySelector(UISelectors.itemCalories).value = '';
        },

        setTotalCalories: function() {

        const totalCalories = ItemCtrl.countCalories();

        document.querySelector(UISelectors.totalCalories).textContent = totalCalories;

        },

        clearEditState: function() {
            UICtrl.clearInput();
            document.querySelector(UISelectors.updateBtn).style.display = 'none';
            document.querySelector(UISelectors.deleteBtn).style.display = 'none';
            document.querySelector(UISelectors.backBtn).style.display = 'none';
            document.querySelector(UISelectors.addBtn).style.display = "inline";

            //Below codes are used to make enter button interact correctly on add button.

            document.querySelector(UISelectors.addBtn).type = "submit";
            document.querySelector(UISelectors.updateBtn).type = "button";
        },
        showEditState: function(item) {

            document.querySelector(UISelectors.itemName).value = item.name;

            document.querySelector(UISelectors.itemCalories).value = item.calories;

            document.querySelector(UISelectors.updateBtn).style.display = 'inline';
            document.querySelector(UISelectors.deleteBtn).style.display = 'inline';
            document.querySelector(UISelectors.backBtn).style.display = 'inline';
            document.querySelector(UISelectors.addBtn).style.display = "none";
            
        //Below codes are used to make enter button interact correctly on update button.

            document.querySelector(UISelectors.addBtn).type = "button";
            document.querySelector(UISelectors.updateBtn).type = "submit";

        },
        clearAll: function(){

            ItemCtrl.clearAll();
            this.populateItemList(ItemCtrl.getItems());
            this.setTotalCalories();
        }
    }
})()


//App Controller

const App = (function (ItemCtrl,StorageCtrl, UICtrl){

    const UISelectors = UICtrl.getUISelectors();

    //Load event listeners

    const loadEventListeners = function() {

        //Add item event

        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);

        //Edit icon event

        document.querySelector(UISelectors.itemList).addEventListener('click', itemUpdateSubmit);

        //Delete button event

        document.querySelector(UISelectors.deleteBtn).addEventListener('click', itemDeleteSubmit);

        //Back button event

        document.querySelector(UISelectors.backBtn).addEventListener('click', backSubmit);

        //Clear button event

        document.querySelector(UISelectors.clearBtn).addEventListener('click', clearSubmit);

    }

    //Add item Submit

    const itemAddSubmit = function(e){

        //Checking if user has entered something, if either of the fields are empty, UICtrl.getItemInput() will return undefined and the check below will fail.

        if (UICtrl.getItemInput()){

            const newItem = UICtrl.getItemInput();

            ItemCtrl.addItem(newItem);
            
            const items = ItemCtrl.getItems();
                
            //Populate list with items
            
            UICtrl.populateItemList(items);

            //Get total calories and add it to UI

            UICtrl.setTotalCalories();


            //Store in localStorage
            StorageCtrl.storeItem(newItem);

            //Clear fields
            UICtrl.clearInput();
        }


        console.log(ItemCtrl.getItems());

        e.preventDefault();
    
    }

        const itemUpdateSubmit = function(e) {

            if(e.target.classList.contains('edit-item')){

                //Get list item id

                const listId = e.target.parentNode.parentNode.id;

                ItemCtrl.setStateEdit(listId);

                const currentItem = ItemCtrl.currentItem();

                UICtrl.showEditState(currentItem);

                //Event listener for update button

                document.querySelector(UICtrl.getUISelectors().updateBtn).addEventListener('click', (e) => {

                        //Updating item in database
                        ItemCtrl.updateItem();

                        //Update local storage
                        StorageCtrl.updateItemStorage();

                        //Clearing UI inputs
                        UICtrl.clearInput();

                        //Clearing edit state
                        UICtrl.clearEditState();

                    e.preventDefault()
                })

                console.log(listId);
            }

            e.preventDefault();
        }

        const itemDeleteSubmit = function(e){

            itemId = ItemCtrl.currentItem().id;

            UICtrl.deleteMeal(itemId);

            //Update local storage
            StorageCtrl.updateItemStorage();

            e.preventDefault();
        }

        const backSubmit = function(e){

            UICtrl.clearEditState();

            e.preventDefault();
        }

        const clearSubmit = function(e){
            
            UICtrl.clearAll();

            //Update local storage
            StorageCtrl.updateItemStorage();

            e.preventDefault();
        }

    

    //Public Methods
    return {

        init: function(){

            console.log('Initializing App...');

            //Clearing edit state

            UICtrl.clearEditState();

            //Fetch items from data controller
            const items = ItemCtrl.getItems();
            
            //Populate list with items
            UICtrl.populateItemList(items);

            //Load event listeners
            loadEventListeners();

            //Set total calories
            UICtrl.setTotalCalories();
        }
    }
})(ItemCtrl, StorageCtrl, UICtrl)

App.init();