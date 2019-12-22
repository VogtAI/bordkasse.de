import {httpPostCommand, goTo} from '../lib.js'
import BalanceList from '../components/BalanceList.js'
import ExpenseItem from '../components/ExpenseItem.js'

export function onTripReady({target, detail}) {
  target.querySelector('h1').innerText = detail.name
  document.getElementById('expense_list').classList.add('ready')

  const creditorChoice = document.getElementById('creditor_choice')
  const participantsChoice = document.getElementById('participants_choice')
  const balanceList = document.getElementById('balance_list')

  detail.members.forEach((member, idx) => {
    const radio = document.createElement('input'),
          checkbox = document.createElement('input'),
          creditorLabel = document.createElement('label'),
          participantsLabel = document.createElement('label')

    radio.setAttribute('type', 'radio')
    radio.setAttribute('name', 'creditor')
    radio.setAttribute('id', `add_expense_creditor_${idx}`)
    radio.setAttribute('value', member)
    radio.setAttribute('required', true)

    creditorLabel.setAttribute('for', `add_expense_creditor_${idx}`)
    creditorLabel.innerText = member

    checkbox.setAttribute('type', 'checkbox')
    checkbox.setAttribute('name', 'participants[]')
    checkbox.setAttribute('id', `add_expense_participant_${idx}`)
    checkbox.setAttribute('value', member)
    checkbox.setAttribute('checked', true)

    participantsLabel.setAttribute('for', `add_expense_participant_${idx}`)
    participantsLabel.innerText = member

    creditorChoice.append(radio, creditorLabel)
    participantsChoice.append(checkbox, participantsLabel)
  })

  balanceList.setMembers(detail.members)
  balanceList.render()
  goTo('/trip/expenses')
}

export function onNewExpense({detail}) {
  document.getElementById('expense_list').prepend(ExpenseItem(detail))
  const balanceList = document.getElementById('balance_list')
  balanceList.onNewExpense(detail)
  balanceList.render()
}

export function onAddExpenseFormOpen({target}) {
  const titleInput = target.querySelector('form [name="title"]')
  const dateInput = target.querySelector('form [name="date"]')

  if (!titleInput.value) {
    titleInput.focus()
  }

  if (!dateInput.value) {
    dateInput.value = (new Date()).toISOString().substr(0, 10)
  }
}

export function initTrip({target, detail}) {
  const command = { command: 'init_trip', data: detail }
  httpPostCommand(target, command)
}

export function addExpense({target, detail}) {
  const command = { command: 'add_expense', data: detail }
  httpPostCommand(target, command)
  goTo('/trip/expenses')
}
