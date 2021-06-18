// template for modelling scselect component
const template = /* html */ `
  <div class="scselect" tabIndex="0">
    <div class="scselect__header">
      <span></span>
    </div>
    <ul class="scselect__options-container">
    </ul>
  </div>`;

/**
 * Main class of scselect
 *
 * @export
 * @class SCSelect
 */
export default class SCSelect {
  /**
   * Creates an instance of SCSelect.
   * @param {HTMLElement} element
   * @param {string} [type="scselect-default"]
   * @memberof SCSelect
   */
  constructor(element) {
    this.element = element;
    this.options = getFormattedOptions(this.element.options);

    // Create DOMParser
    const parser = new DOMParser();
    // Parse template
    const htmlDocument = parser.parseFromString(this.template, "text/html");
    this.customElement = htmlDocument.querySelector(".scselect");
    // Hide original select
    element.style.display = "none";
    // Insert scselect element after original select element
    element.after(this.customElement);
    // Init composing process to make awesome ready scselect
    init(this);
  }

  /**
   * Getter for selected options
   *
   * @readonly
   * @memberof SCSelect
   */
  get selectedOption() {
    if (this.element.multiple) return this.options.filter(option => option.selected);
    return this.options.find(option => option.selected);
  }

  /**
   * Getter for index of selected options
   *
   * @readonly
   * @memberof SCSelect
   */
  get selectedOptionIndex() {
    if (this.element.multiple) {
      return this.selectedOption.map(selected => this.options.indexOf(selected));
    }
    return this.options.indexOf(this.selectedOption);
  }

  /**
   * Getter for getting template custom element
   *
   * @readonly
   * @memberof SCSelect
   */
  get template() {
    return template;
  }

  /**
   * Getter for headerElement of this.customElement
   *
   * @readonly
   * @memberof SCSelect
   */
  get headerElement() {
    return this.customElement.querySelector(".scselect__header");
  }

  /**
   * Getter for optionsContainerElement of this.customElement
   *
   * @readonly
   * @memberof SCSelect
   */
  get optionsContainerElement() {
    return this.customElement.querySelector(".scselect__options-container");
  }

  /**
   * Select an option specified by value then make it selected
   *
   * @param {String} value
   * @return {Array}
   * @memberof SCSelect
   */
  selectValue(value) {
    // find option to be selected by value specified
    const newSelectedOption = this.options.find(option => option.value === value);
    if (!newSelectedOption) return;

    //  get current selected option then make it as previous selected
    //  by reference it to previousSelectedOption
    const previousSelectedOption = this.selectedOption;

    // change previousSelectedOption to be not selected anymore
    previousSelectedOption.selected = false;
    previousSelectedOption.element.selected = false;

    // change newSelectedOption to be current selected
    newSelectedOption.selected = true;
    newSelectedOption.element.selected = true;

    return [previousSelectedOption, newSelectedOption];
  }
}

/**
 * Compose scselect component
 *
 * @param {HTMLElement} scselect
 */
function init(scselect) {
  // create debounceTimeout for storing timeout function
  let debounceTimeout;
  let searchTerm = "";
  // inner helper function to select option then render to the DOM
  const selectAndRender = value => {
    const [previousSelected, currentSelected] = scselect.selectValue(value);
    renderSelectedValue(scselect, previousSelected, currentSelected);
  };

  // initial render selected value or just show placeholder
  renderSelectedValue(scselect);

  // create DocumentFragment to store optionElement temporary
  const optionsFragment = document.createDocumentFragment();
  scselect.options.forEach(option => {
    // creating optionElement
    const optionElement = document.createElement("li");
    optionElement.classList.add("scselect__option");
    optionElement.textContent = option.label;
    optionElement.dataset.value = option.value;
    optionElement.addEventListener("click", function () {
      // every click on optionElement select it and render to the DOM
      selectAndRender(option.value);
    });
    // append optionElement to DocumentFragment
    optionsFragment.appendChild(optionElement);
  });
  // finally append all optionElement inside DocumentFragment to the DOM
  scselect.optionsContainerElement.appendChild(optionsFragment);

  // show or hide options when customElement clicked
  scselect.customElement.addEventListener("click", function () {
    this.toggleAttribute("data-open");
  });
  // hide options when customElement lose focus
  scselect.customElement.addEventListener("blur", function () {
    this.toggleAttribute("data-open", false);
  });
  // add interactivity for keyboard buttons press
  scselect.customElement.addEventListener("keydown", function (event) {
    switch (event.code) {
      case "Space": {
        this.toggleAttribute("data-open");
        break;
      }
      case "Enter":
      case "Escape": {
        this.toggleAttribute("data-open", false);
        this.blur();
        break;
      }
      case "ArrowUp": {
        const previousOption = scselect.options[scselect.selectedOptionIndex - 1];
        if (previousOption) selectAndRender(previousOption.value);
        break;
      }
      case "ArrowDown": {
        const nextOption = scselect.options[scselect.selectedOptionIndex + 1];
        if (nextOption) selectAndRender(nextOption.value);
        break;
      }
      case "End": {
        const last = scselect.options[scselect.options.length - 1];
        selectAndRender(last.value);
        break;
      }
      case "Home": {
        const first = scselect.options[0];
        selectAndRender(first.value);
        break;
      }
      default: {
        // while user still typing clearTimeout
        clearTimeout(debounceTimeout);
        // storing all keyboard key pressed into searchTerm
        searchTerm += event.key;
        // if user within 500ms not typing anything reset searchTerm
        debounceTimeout = setTimeout(() => {
          searchTerm = "";
        }, 500);

        // searching an option that label start with searchTerm
        const searchedOption = scselect.options.find(option => {
          return option.label.toLowerCase().startsWith(searchTerm);
        });
        // if searchedOption is not empty then select its value and render to the DOM
        if (searchedOption) selectAndRender(searchedOption.value);
        break;
      }
    }
  });
}

/**
 * Create formatted array option from optionElements
 *
 * @param {HTMLOptionsCollection } optionElements
 * @return {Array}
 */
function getFormattedOptions(optionElements) {
  return [...optionElements].map(optionElement => ({
    value: optionElement.value,
    label: optionElement.label,
    selected: optionElement.selected,
    element: optionElement,
  }));
}

/**
 * Render current selected value to the DOM
 *
 * @param {SCSelect} scselect
 * @param {Object} [previous=null]
 * @param {Object} [current=null]
 * @return {*}
 */
function renderSelectedValue(scselect, previous = null, current = null) {
  // header text scselect
  const headerTextElement = scselect.headerElement.children[0];
  // if no previous and current then header text scselect is placeholder or first option label
  if (!previous && !current) {
    const placeholder = scselect.element.dataset.placeholder;
    headerTextElement.textContent = placeholder || scselect.options[0].label;
    return;
  }
  // remove .selected from previous selected option element
  scselect.optionsContainerElement
    .querySelector(`[data-value="${previous.value}"]`)
    .classList.remove("selected");
  // get current selected option element
  const newSelectedOptionElement = scselect.optionsContainerElement.querySelector(
    `[data-value="${current.value}"]`
  );
  // add .selected to current selected option element
  newSelectedOptionElement.classList.add("selected");
  // always get view to this option element
  newSelectedOptionElement.scrollIntoView({ block: "nearest" });
  // change header text scselect with label of current selected option element
  scselect.headerElement.children[0].textContent = current.label;
}
