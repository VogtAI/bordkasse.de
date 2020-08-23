import { deriveKey, fragment } from '../lib.js'
import JsonForm from './JsonForm.js'

export default class PasswordInputForm extends JsonForm {
  constructor () {
    super()
    this.append(fragment`
      <h3>Diese Bordkasse ist passwortgesch&uuml;tzt!</h3>
      <label for="password_input_password">Passwort</label>
      <input type="password" id="password_input_password" name="password" required />
      <input type="submit" value="Bordkasse &ouml;ffnen" />
      <div class="errors"></div>`
    )
  }

  connectedCallback () {
    super.connectedCallback()
    this.addEventListener('app:forbidden', onForbidden)
  }

  format (passwordInput) {
    return deriveKey(passwordInput.password)
  }
}

function onForbidden ({ detail }) {
  JsonForm.showErrors(this._form, [{ error: detail }])
}
