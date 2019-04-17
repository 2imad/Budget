  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyD5KmMIQPGWbYaKGi9DHnFfz5mU1rfK6Lg",
    authDomain: "photowall-8a567.firebaseapp.com",
    databaseURL: "https://photowall-8a567.firebaseio.com",
    projectId: "photowall-8a567",
    storageBucket: "photowall-8a567.appspot.com",
    messagingSenderId: "697910424434"
  };
  firebase.initializeApp(config);



// BUDGET CONTROLLER 

const budgetController = (function() {

    const Expense = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = null
    }

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    const Income = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }
    const data = {
        allItems: {
            exp: [],
            inc: []

        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: null
    }
    const calculateTotal = function(type) {
        let sum = 0
        data.allItems[type].forEach(function(curr) {
            sum += curr.value
        })
        data.totals[type] = sum
    }

    return {
        addItem: function(type, desc, val) {
            let newItem, ID

            if (data.allItems[type].length > 0) {
                // create new ID 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1

            } else {
                ID = 0
            }
            // create new item based on 'exp' or 'inc' type 
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val)
                
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val)
                console.log(newItem)
            }
            
            // push the new item in the array 
            data.allItems[type].push(newItem)
            console.log(data)
                // return the item 
            return newItem

        },
        deleteItem: function(type, id) {

            const ids = data.allItems[type].map(current => {
                return current.id
            })
            const index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }


        },
        calculateBudget: function() {
            calculateTotal('exp')
            calculateTotal('inc')

            data.budget = data.totals.inc - data.totals.exp

            if (data.budget > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = null
            }
        },
        calculatePercentages: function() {

            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc)
            })


        },
        getPercentages: function() {
            const allPerc = data.allItems.exp.map(current => {
                return current.getPercentage()
            })
            return allPerc
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },
        testInput: function() {
            console.log(data)
        }
    }
})()



// UIController 
const UIcontroller = (function() {
    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        currentDate : '.budget__title--month'
    }

    const {
        inputType,
        inputDescription,
        inputValue,
        incomeContainer,
        expensesContainer,
        budgetLabel,
        incomeLabel,
        expenseLabel,
        percentageLabel,
        expensesPercentageLabel,
        currentDate
    } = DOMStrings



    var formatNumber = function(num, type) {
        var numSplit, intArr, dec, resultArr;
        num = Math.abs(num); // returns the absolute value of a number
        num = num.toFixed(2); // converts number into a string, keeping only two decimals
        numSplit = num.split("."); // divide inputed number in 2 parts: numbers before decimal dot, and numbers AFTER the decimal dot
        intArr = numSplit[0].split(""); // split the number into an array
        dec = numSplit[1];
        resultArr = [];
        for (var i = intArr.length - 1; i >= 0; i--) {
            // then looped backwards over each digit in the array, inserting commas in front of every 3rd digit
            if ((intArr.length - i) % 3 === 1 && i !== intArr.length - 1) {
                resultArr.unshift(",");
            }
            resultArr.unshift(intArr[i]); // adds new items to the beginning of an array
        }
        return (type === "inc" ? '+ ' : "- ") + resultArr.join("") + "." + dec;
        // used the join method to convert the array back into a string.
    };



    return {
        getInput: function() {
            return {
                type: document.querySelector(inputType).value, // value of selection , will be either inc or exp 		
                description: document.querySelector(inputDescription).value,
                value: parseFloat(document.querySelector(inputValue).value)
            }
        },
        addListItem: function(obj, type) {
            let HTML, newHTML, element, fields

            if (type === 'inc') {
                element = incomeContainer
                HTML = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = expensesContainer
                HTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHTML = HTML.replace('%id%', obj.id)
            newHTML = newHTML.replace('%description%', obj.description)
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type))
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
        },
        deleteListItem: function(selectorId) {
            const el = document.getElementById(selectorId)
            el.parentNode.removeChild(el)


        },
        clearFields: function() {
            let fields, fieldsArr
            fields = document.querySelectorAll(inputDescription + ', ' + inputValue)

            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach((current, index, array) => {
                current.value = ''

            })

            fieldsArr[0].focus()

        },

        displayBudget: function(obj) {

            document.querySelector(budgetLabel).textContent = obj.budget
            document.querySelector(incomeLabel).textContent = obj.totalInc
            document.querySelector(expenseLabel).textContent = obj.totalExp
            if (obj.percentage > 0) {
                document.querySelector(percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(percentageLabel).textContent = '--'
            }
        },
        displayPercentages: function(percentages) {
            const fields = document.querySelectorAll(expensesPercentageLabel)
            const nodeListForEach = function(list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i)
                }

            }


            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '--'
                }

            })



        },
        displayMonth: function(){
         
          let now = new Date();
          year = now.getFullYear();
          month = now.toLocaleString("en-us", {month: "long"});
          

        document.querySelector(currentDate).textContent = month + ' ' + year  
   

        },

        getDOMStrings: function() {
            return DOMStrings
        }
    }


})()




// App controller 
const controller = (function(budgetctl, UIctl) {

    const setupEventListener = () => {
        const DOM = UIctl.getDOMStrings()
        document.querySelector(DOM.inputBtn).addEventListener('click', cntrlAddItem)
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                cntrlAddItem()
            }
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }

    const updateBudget = function() {

        budgetctl.calculateBudget()

        const budget = budgetctl.getBudget()


        UIctl.displayBudget(budget)

    }

    const updatePercentages = function() {

        budgetctl.calculatePercentages()

        let percentages = budgetctl.getPercentages()
        UIctl.displayPercentages(percentages)
    }




    const cntrlAddItem = () => {
        let input, newItem



        input = UIctl.getInput()


        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetctl.addItem(input.type, input.description, input.value)
        }

        if (newItem) {
            UIctl.addListItem(newItem, input.type)
            UIctl.clearFields()
            updateBudget()
            updatePercentages()
        }

    }

    const ctrlDeleteItem = (event) => {
        const itemId = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemId) {
            let splitId = itemId.split('-')
            let type = splitId[0]
            let ID = parseInt(splitId[1])

            budgetctl.deleteItem(type, ID)

            UIctl.deleteListItem(itemId)
            updateBudget()


        }

    }

    return {
        init: function() {
            console.log('Application Launched')
            UIctl.displayMonth()
            UIctl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: null
            })
            setupEventListener()
        }
    }

})(budgetController, UIcontroller)
controller.init()
