import { attachRoutes, dispatch, goTo, html } from '../lib.js'
import AddExpenseForm from './AddExpenseForm.js'

import {
  onInitTrip as onInitTripBalance,
  onNewExpense as onNewExpenseBalance,
  onSettleUpClick
} from '../handlers/balance.js'

import {
  clearLocal,
  onInitTrip as onInitTripExpenses,
  onNewExpense as listOnNewExpense,
  onFirstExpense,
  onImmediateNewExpense,
  onLocalNewExpense
} from '../handlers/expenses.js'

export default class FcTrip extends HTMLElement {
  connectedCallback () {
    attachRoutes([
      ['click -> menu h2', onTabSwitch],
      ['click -> #refresh_button', onRefreshButtonClicked],
      ['touchstart -> h1,[path="/trip"]', checkPull],
      ['app:did_init_trip', onInitTrip],
      ['app:did_add_expense', onNewExpense],
      ['app:just_did_add_expense', withIdTarget('expense_list', onImmediateNewExpense)],
      ['app:failed_to_add_expense', withIdTarget('expense_list', onLocalNewExpense)],
      ['app:navigate -> [path="add_expense"]', onAddExpenseFormOpen],
      ['app:did_unauthorized', onUnauthorized],
      ['app:settle_up', onSettleUpClick],
      ['jsonsubmit -> [name="add_expense"]', onAddExpenseFormSubmit],
      ['jsonsubmit -> [name="password_input"]', onPasswordSubmit],
      ['app:sync', clearLocal],
      ['app:pulldown', ({ target }) => dispatch(target, 'app:sync')],
    ], this)

    goTo('expenses')
    dispatch(this, 'app:sync')
  }
}

function onTabSwitch ({ target }) {
  const menu = target.closest('menu')
  const activeItem = menu.querySelector('[to].active')

  if (target === activeItem) {
    return
  }

  if (activeItem) {
    activeItem.classList.remove('active')
  }

  target.classList.add('active')
}

function onRefreshButtonClicked (event) {
  event.preventDefault()
  dispatch(event.target, 'app:sync')
}

function onInitTrip ({ currentTarget, detail }) {
  currentTarget.append(
    html`
    <menu>
      <h2 to="expenses" class="active">Expenses</h2>
      <h2 to="balance">Balance</h2>
    </menu>`,
    html`
    <section path="expenses">
      <div class="spinner"></div>
      <ul id="expense_list" class="expense-list">
        <li class="placeholder">
          <p>You haven't spent anything yet, well done!</p>
          <p>When someone buys something, just click on "Add an expense" below to record it.</p>
        </li>
      </ul>
      <footer>
        <a href="./" title="Home page" class="nav">❮ Home</a>
        <button to="add_expense" title="Add an expense">Add an expense</button>
        <a href="#" title="Refresh the expenses" role="button" class="nav" id="refresh_button">↻ Refresh</a>
      </footer>
    </section>`,
    html`
    <section path="balance">
      <dl id="balance_list" class="balance-list"></dl>
      <div class="debt-list">
        <h4>How to balance?</h4>
        <ul></ul>
      </div>
    </section>`,
    html`
    <section path="add_expense">${AddExpenseForm(detail.members)}</section>`
  )

  document.querySelector('h1').innerText = detail.name

  const expenseList = document.getElementById('expense_list')

  onInitTripExpenses(expenseList, detail)
  onInitTripBalance(document.getElementById('balance_list'), detail)
  currentTarget.addEventListener(
    'app:did_add_expense',
    () => onFirstExpense(expenseList),
    { once: true }
  )

  goTo('expenses')

  dispatch(currentTarget, 'local:storetrip', trip => ({ ...trip, title: detail.name }))
}

function onNewExpense ({ detail }) {
  listOnNewExpense(document.getElementById('expense_list'), detail)
  onNewExpenseBalance(document.getElementById('balance_list'), detail)
}

function onUnauthorized ({ target }) {
  const input = html`<password-input-form path="password_input" name="password_input"></password-input-form>`
  target.append(input)
  target.addEventListener('app:did_init_trip', () => input.remove(), {once: true})
  goTo('password_input')
}

function onPasswordSubmit({currentTarget, detail }) {
  dispatch(currentTarget, 'app:sync', { key: detail })
}

function onAddExpenseFormOpen ({ target }) {
  const titleInput = target.querySelector('form [name="title"]')
  const dateInput = target.querySelector('form [name="date"]')

  if (!titleInput.value) {
    titleInput.focus()
  }

  if (!dateInput.value) {
    dateInput.value = (new Date()).toISOString().substr(0, 10)
  }
}

function onAddExpenseFormSubmit ({ target, detail }) {
  dispatch(target, 'app:postcommand', { command: 'add_expense', data: detail })
  target.addEventListener('app:http_request_stop', () => {
    dispatch(target, 'app:sync')
    goTo('expenses')
  }, { once: true })
}

function withIdTarget (id, handler) {
  return event => handler(document.getElementById(id), event.detail)
}

/**
 * Binds temporary listener on touch events to re-trigger
 * higher-level pull events
 */
export function checkPull ({ target, targetTouches, timeStamp }) {
  if (!targetTouches.length) {
    return
  }

  const startTouch = targetTouches[0]

  target.addEventListener('touchend', (event) => {
    if (event.changedTouches.length) {
      const endTouch = event.changedTouches[0]
      const duration = event.timeStamp - timeStamp

      if (duration > 2000 || duration < 100) {
        return
      }

      const [diffX, diffY] = [
        endTouch.clientX - startTouch.clientX,
        endTouch.clientY - startTouch.clientY
      ]

      if (Math.abs(diffX) < 80 && diffY > 100) {
        dispatch(event.target, 'app:pulldown')
      }
    }
  }, { once: true })
}