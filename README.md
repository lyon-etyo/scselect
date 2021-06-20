# SCSelect
#### Simple Custom Select with Vanilla JS

Easy way to make custom select.

Just download scselect.js file and put it into your project.

### Example Usage #1:

__HTML__:

Just add multiple attribute select in html if you want multiple mode.
```html
<select data-placeholder="Choose a Weapon">
    <option value="0">Sword</option>
    <option value="1">Bow</option>
    <option value="2">Mallet</option>
    <option value="3">Axe</option>
</select>
```

__Javascript__:
```javascript
import SCSelect from "./scselect.js";

const selectElement = document.querySelector("select");

new SCSelect(selectElement);
```

### Task List
- [x] Adding multiple mode
- [ ] Adding search form
