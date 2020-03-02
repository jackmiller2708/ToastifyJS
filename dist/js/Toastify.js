/**
 * notifcation types
 * @type {string}
 */
const NAME_ITEM = "el-toast",
    ICONS = {
		SUCCESS: {
			CLASSES: ["fas", "fa-check-circle"]
		},
		DANGER: {
			CLASSES: ["fas", "fa-exclamation-triangle"]
		},
		INFO: {
			CLASSES: ["fas", "fa-exclamation-circle"]
		},
		ALERT: {
			CLASSES: ["fas", "fa-exclamation-triangle"]
		},
	},
	MOBILE_RESOLUTION = 720
;

// Create the template
let template_container = buildTemplate(document.querySelector('body'));


let $templateItem = document.querySelector("#elToastItem");

// Clone and extract its content
$templateItem = $templateItem.cloneNode(true).content;

/**
 * Represents a notification Toast
 */
class ToastItem extends HTMLLIElement {

    /**
     * Initializes the ToastItem Class object
     */
    constructor() {
		super();

		// Register a new TOAST_REMOVED custom event if not exist, otherwise create it.
		this._eventOnRemove = new CustomEvent("TOAST_REMOVED") || document.createEvent("TOAST_REMOVED");

		// Set initial visible to false
		this.isVisible = false;
	}

    /**
     * Overrides the default connectedCallback method
     */
	connectedCallback() {

		// Get the Toastify object's attributes
		let type = this.getAttribute("type").toUpperCase(),
		description = this.getAttribute("description"),
		timeout = Number(this.getAttribute("timeout")),
		hideClose = Boolean(JSON.parse(this.getAttribute("hide-close")));

		// Check if the type is valid
		if (!ICONS.hasOwnProperty(type)) {
			throw new Error(`[${NAME_ITEM}] invalid type`);
		}

		let $item = $templateItem.cloneNode(true),								// Copy the template item
		$itemDescription = $item.querySelector(`.${NAME_ITEM}__description`),  	// Grab item's description container
		$itemIcon = $item.querySelector(`.${NAME_ITEM}__icon`),					// Grab item's icon container
		$icon = document.createElement("i"),									// Create notification icon
		$itemProgress = $item.querySelector(`.${NAME_ITEM}__progress`),    		// Grab progress bar wrapper
		$itemProgressBar = $item.querySelector(`.${NAME_ITEM}__bar`),			// Grab progress bar container
		$itemClose = $item.querySelector(`.${NAME_ITEM}__close`),				// Grab item close button container
		$itemCloseAction = $item.querySelector(`.${NAME_ITEM}__close button`), 	// Grab item close button
		$container = this.parentElement.parentElement;

		// Listen to TOAST_REMOVED event
		this.addEventListener("TOAST_REMOVED", this.checkVisible, false);

		// If the object is hidden or closed, remove it
		if (hideClose) {
			$itemClose.remove();
		} else {

			// If not then listen to click event of the close button
			$itemCloseAction.addEventListener("click", event =>
				$container.remove(this.id)
			);
		}

		// Add notify icon class to icon
		$icon.classList.add(...ICONS[type].CLASSES);

		// Add the icon to icon container
		$itemIcon.appendChild($icon);
		
		// Set item classes
		this.classList.add(`${NAME_ITEM}__item`);
		this.classList.add(`${NAME_ITEM}__item--${type.toLowerCase()}`);
		
		// If the description is over 100 characters
		if (description.length > 100) {
			setShortDescription();
		} else {
			setFullDescription();
		}

		/**
		 * Sets full description for the toast
		 * @param {Event} event 
		 */
		function setFullDescription(event) {
			$itemDescription.innerHTML = description;
			
			// If the caller does not pass an event,
			// exit the function.
			if (!event) return;

			// Create a "view less" button
			let viewLess = document.createElement("button");
			viewLess.innerText = "View less";
			
			// Listen to click event. Execute setShortDescription if clicked
			viewLess.addEventListener("click", setShortDescription);
			
			// Add the button to item's description
			$itemDescription.appendChild(viewLess);
		}
		
		/**
		 * Sets short description for the toast
		 */
		function setShortDescription() {

			// Create a "view more" button
			let viewMore = document.createElement("button");
			viewMore.innerText = "View more";
			
			// Listen to click event. Execute setFullDescription if clicked
			viewMore.addEventListener("click", setFullDescription);
			
			// cut the description down to 100 characters then add "..."
			$itemDescription.innerHTML = description.slice(0, 99) + "...";

			// Add the button to item's description
			$itemDescription.appendChild(viewMore);
		}

		// Add this 
		this.appendChild($item);
		
		this.checkVisible();

		// If the counter reaches 0, hide the toast
		if (timeout === 0) {
			$itemProgress.classList.add(`${NAME_ITEM}__progress--hide`);
			return;
		}

		let countdownValue = 100,
		size = timeout - countdownValue;

		let checking = setInterval(() => {
			if (this.isVisible && !$container.isMouseOver()) {
				$itemProgressBar.style.width =
				size * 100 / (timeout - countdownValue) + "%";

				size -= countdownValue;
			}

			if (size < -countdownValue) {
				$container.remove(this.id);

				clearInterval(checking);
			}
		}, countdownValue);
	}

    /**
     * Checks whether it's the toast's turn to show up
     */
	checkVisible() {
		if (this.parentNode) {
			let numCards = document.body.clientWidth > MOBILE_RESOLUTION ? 3 : 1;
			this.isVisible = Array.from(this.parentNode.children).indexOf(this) < numCards;
		}
	}

    /**
     * Removes the toast
     * @returns {boolean}
     */
	remove() {
		let parent = this.parentElement;
		this.classList.add(`${NAME_ITEM}__item--removing`);
		if (!parent || parent.nodeType !== Node.ELEMENT_NODE || !this || this.nodeType !== Node.ELEMENT_NODE)
			return false;

		setTimeout(() => {
			if (parent.hasChildNodes() && parent.contains(this)) {
				parent.removeChild(this);

				parent.parentElement.dispatchEvent(this._eventOnRemove);

				return true;
			}
			return false;
		}, 300);
	}

    /**
     * Set function to be executed on close
     * @param {Function} action The function to be executed on close
     */
	setOnClose(action) {
		let $itemCloseAction = this.querySelector(`.${NAME_ITEM}__close button`);

		$itemCloseAction.addEventListener("click", action);
	}

    /**
     * Set actions
     * @param {object[]} actions
     */
	setActions(actions) {

		// If no action is set, exit the method
		if (!actions.length) {
			return;
		}
		
		// Grab action container
		let $itemActions = this.querySelector(`.${NAME_ITEM}__action`);
		
		// For each action in actions
		actions.map(action => {
			if (typeof action !== "object") {
				throw new Error(`[${NAME_ITEM}] Invalid action`);
			}

			let $action = document.createElement("button");

			if (typeof action.title !== "string") {
				throw new Error(`[${NAME_ITEM}] Enter a valid title for the action`);
			}

			$action.innerText = action.title;

			if (typeof action.onClick !== "function") {
				throw new Error(`[${NAME_ITEM}] Enter a valid role for the action`);
			}

			$action.addEventListener("click", action.onClick);

			$itemActions.appendChild($action);
		});
	}

    /**
     * Returns the item name
     * @returns {string} The name of the item
     */
	static is() {
		return `${NAME_ITEM}-item`;
	}
}

// Defines a custom li tag.
customElements.define(ToastItem.is(), ToastItem, { extends: "li" });

// Default contants
const NAME = "el-toast",
TIMEOUT_REMOVE = 8000,
DOM_LIMIT = 5;

// Grab the template tag
let $template = document.querySelector("#elToast");

// clone the template and grab the unordered list from the document fragment object
$template = $template.cloneNode(true).content.querySelector(`.${NAME}`);

/**
 * Represent a Toast object
 */
class Toast extends HTMLElement {

	/**
	 * Initalizes the Toast object.
	 */
	constructor() {
		super();

		// Register a new TOAST_REMOVED custom event if not exist, otherwise create it.
		this._eventOnRemove = new CustomEvent("TOAST_REMOVED") || document.createEvent("TOAST_REMOVED");

		// Initializes private variables
		this._mouseOver = false;
		this._list = {};
		this._listCache = {};
	}

    /**
     * Listens for mouseover event
     * @returns {Boolean} True or False
     */
	isMouseOver() {
		return this._mouseOver;
	}

    /**
     * Sets mouseover value
     * @param {String} value
     */
	setMouseOver(value) {
		this._mouseOver = Boolean(value);
	}

    /**
     * Overrides the default connectedCallback method
     */
	connectedCallback() {

		this.appendChild($template);
		
		// Listent to events
		this.addEventListener("TOAST_REMOVED", broadcastToastRemoved, false);
		this.addEventListener("mouseenter", handleMouseOver);
		this.addEventListener("touchstart", handleMouseOver);
		this.addEventListener("touchend", handleMouseOut);
		document.body.addEventListener("touchend", handleMouseOut);
		this.addEventListener("mouseleave", handleMouseOut);

		function handleMouseOver() {
			$template.classList.add(`${NAME}--paused`);
			this.setMouseOver(true);
		}

		function handleMouseOut() {
			$template.classList.remove(`${NAME}--paused`);
			this.setMouseOver(false);
		}

		function broadcastToastRemoved() {
			Object.values(this._list)
			.slice(0, 5)
			.map(toast => {
			toast.dispatchEvent(this._eventOnRemove);
			});
		}
	}

	/**
	 * Publish toast with a set of settings
	 * @param {Object} config The settings for the toast
	 */
	publish(config) {
		
		// Get elements from config object if existed, otherwise set as default
		let type = String(config.type || "info"),
		description = config.description || "",	  

		timeout = config.timeout < 0 || typeof config.timeout !== "number" 	? TIMEOUT_REMOVE : config.timeout,

		onClose = typeof config.onClose === "function" ? config.onClose : function() {},

		hideClose = Boolean(config.hideClose),
		actions = typeof config.actions === "object" ? config.actions : [],
		$toast = document.createElement("li", { is: `${NAME}-item` }),

		id = "toast_" + generateId();

		if (!description) {
			throw new Error(`[${NAME}] A description is required`);
		}

		$toast.id = id;
		$toast.setAttribute("type", type);
		$toast.setAttribute("description", description);
		$toast.setAttribute("timeout", timeout);
		$toast.setAttribute("hide-close", String(hideClose));

		$toast = $toast.cloneNode(true);

		if (Object.values(this._list).length > DOM_LIMIT) {
			this._listCache[id] = {
			el: $toast,
			hideClose: hideClose,
			onClose: onClose,
			actions: actions
			};
		} else {
			$toast = $template.appendChild($toast);

			if (!$toast) {
				return;
			}
			if (!hideClose) {
				$toast.setOnClose(onClose);
			}

			if (actions.length) {
				$toast.setActions(actions);
			}

			this._list[id] = $toast;
		}
		
		/**
		 * Randomly generate toast id
		 */
		function generateId() {
			return Math.random().toString(36).substr(2, 9);
		}

		return id;
	}

	/**
	 * Removes toast
	 * @param {Number} id 
	 */
	remove(id) {
		if (this._list.hasOwnProperty(id)) {
			this._list[id].remove();
			delete this._list[id];
		} else if (this._listCache.hasOwnProperty(id)) {
			delete this._listCache[id];
		} else {
			return;
		}

		if (Object.keys(this._listCache).length) {
			let keyCached = Object.keys(this._listCache)[0],
			valueCached = Object.values(this._listCache)[0];

			valueCached.el = $template.appendChild(valueCached.el);

			if (!valueCached.hideClose) {
				valueCached.el.setOnClose(valueCached.onClose);
			}

			if (valueCached.actions.length) {
				valueCached.el.setActions(valueCached.actions);
			}

			this._list[keyCached] = valueCached.el;

			delete this._listCache[keyCached];
		}
	}

	/**
	 * returns the name of the template element
	 * @returns {String} The name of the template element
	 */
	static is() {
		return NAME;
	}
}

/**
 * Defines the custom element
 */
customElements.define(Toast.is(), Toast);

/**
 * Build the template
 * @param {HTMLElement} target 
 */
function buildTemplate(target){
	let template_name = "el-toast";

	// Create elements
	let template_container 	= document.createElement('div'),
	item_container 			= document.createElement(template_name),
	document_fragment 		= document.createElement('template'),
	icon_container 			= document.createElement('div'),
	close_button_container  = document.createElement('div'),
	close_button 			= document.createElement('button'),
	close_button_text 		= document.createElement('i'),
	description_container 	= document.createElement('div'),
	action_container 		= document.createElement('div'),
	progress_bar_wrapper  	= document.createElement('div'),
	progress_bar_container 	= document.createElement('div'),
	document_fragment_2 	= document.createElement('template'),
	document_fragment_2_ul  = document.createElement('ul');


	// Assign IDs
	template_container.id  = "template";
	document_fragment.id   = "elToastItem";
	document_fragment_2.id = "elToast";

	// Assign Classes
	icon_container.classList 		 = template_name + "__icon";
	close_button_container.classList = template_name + "__close";
	description_container.classList  = template_name + "__description";
	action_container.classList 		 = template_name + "__action";
	progress_bar_wrapper.classList 	 = template_name + "__progress";
	progress_bar_container.classList = template_name + "__bar";
	close_button_text.classList 	 = "fa fa-fw fa-times";
	document_fragment_2_ul.classList = template_name;

	// Add predefined styled
	template_container.style.fontSize  = "10px";
	progress_bar_container.style.width = "100%";

	// Append elements
	close_button.appendChild(close_button_text);
	close_button_container.appendChild(close_button);
	progress_bar_wrapper.appendChild(progress_bar_container);
	
	// Append element to document fragments
	document_fragment.content.appendChild(icon_container);
	document_fragment.content.appendChild(close_button_container);
	document_fragment.content.appendChild(description_container);
	document_fragment.content.appendChild(action_container);
	document_fragment.content.appendChild(progress_bar_wrapper);

	document_fragment_2.content.appendChild(document_fragment_2_ul);

	// Append everything to the template container
	template_container.appendChild(item_container);
	template_container.appendChild(document_fragment);
	template_container.appendChild(document_fragment_2);

	// Addpend the notification to the body
	target.appendChild(template_container);

	return template_container;
}