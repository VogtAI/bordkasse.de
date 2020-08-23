import { html } from '../lib.js'

const MIN_MEMBERS = 2

export default function InitTripForm () {
  const form = html`
    <json-form name="init_trip" class="init-trip">
      <label for="init_trip_name">Name des Ausflugs</label>
      <input type="text" id="init_trip_name" name="name" autocomplete="off" required/>
      <input type="hidden" name="currency" value="EUR" readonly/>
      <label>Wer ist dabei?</label>
      <item-list init-items="2" class="members minimum-count" onItem-list:update=${onMembersUpdate}>
        <template>
          <input type="text" name="members[]" placeholder="Put a name here" minlength="1" required/>
        </template>
        <button type="button" class="add">+</button>
      </item-list>
      <div class="toggle">
        <label for="init_trip_password_toggle">Passwortschutz</label>
        <input type="checkbox" id="init_trip_password_toggle" onChange=${onPasswordToggle} />
      </div>
      <div class="errors"></div>
      <input type="submit" name="submit" value="Los gehts!"/>
    </json-form>`

  form.validate = validate

  return form
}

InitTripForm.style = `
.init-trip .item input {
  margin-bottom: 0;
  width: 100%;
}`

function validate (initTrip) {
  const uniqueMembers = new Set(initTrip.members)
  if (uniqueMembers.size !== initTrip.members.length) {
    return [{ error: 'Doppelter Name, bitte &auml;ndern!' }]
  }

  return []
}

function onMembersUpdate ({ target, detail }) {
  target.classList.toggle('minimum-count', detail <= MIN_MEMBERS)
}

function onPasswordToggle ({ target }) {
  const form = target.form
  const passwordSection = form.querySelector('.password-control')

  if (target.checked && !passwordSection) {
    form.insertBefore(
      html`<div class="password-control form-like">
            <label for="init_trip_password">Passwort</label>
            <input id="init_trip_password" type="password" required/>
            <small>Deine Daten werden Ende zu Ende mit diesem Passwort verschl&uuml;sselt. Bordkasse speichert dieses nicht!</small>
          </div>`,
      target.parentNode.nextSibling
    )
  } else if (!target.checked && passwordSection) {
    form.removeChild(passwordSection)
  }
}
