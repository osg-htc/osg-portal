

export const validateForm = (form) => {

    const errorNode = document.getElementById("form-error")

    // Check that all input validity
    for (const el of form.querySelectorAll("[required]")) {
      if (!el.reportValidity()) {
        errorNode.textContent = "Please fill out all elements in the form, if not applicable you can write 'NA'.";
        errorNode.hidden = false;
        return false;
      }
    }

    // Check that the h captcha is populated
    const formData = getFormData(form)
    if( !formData['h-captcha-response']['value'] ){
        errorNode.textContent = "Complete the hCaptcha";
        errorNode.hidden = false;
        return false;
    }

    // Form is valid
    return true;
}

/**
 * Grabs all the form data as a dictionary of input information key'd by name
 * @param form - Form element
 * @returns {{}}
 */
export const getFormData = (form) => {

    // Create default inputs for elements that are not reported if values are none
    let defaults = Array.from(form.getElementsByTagName("input")).reduce((currentValue, element) => {
        console.log(element)
        if(element.type == "checkbox"){
            currentValue.push([element.name, "off"])
        }
        return currentValue
    }, [])

    const formData = new FormData(form);
    const formDataAndDefaults = defaults.concat(Array.from(formData)) // Order important, defaults should be overwritten

    let namesAndInputs = formDataAndDefaults.reduce((currentValue,[name, value]) => {
        currentValue[name] = {
            name: name,
            value: value
        }

        let element = document.getElementById(name)

        if(element?.tagName === "SELECT"){
            currentValue[name]["value"] = document.querySelectorAll(`option[value='${value}']`)[0].textContent.trim()
        }

        if(isVisible(element)){
            currentValue[name]["label"] = document.getElementById(name).labels[0].textContent.trim()
        }

        return currentValue
    }, {})

    // Convert 'off' and 'on' check values to bools
    Object.keys(namesAndInputs).forEach((k,i) => {
        if(['off', 'on'].includes(namesAndInputs[k].value)){
            namesAndInputs[k].value = namesAndInputs[k].value === "off" ? "False" : "True";
        }
    })

    return namesAndInputs
}

let isVisible = (htmlElement) => {
    try {
        return htmlElement.offsetParent !== null
    } catch (e) {
        console.error(e)
        return false
    }
}
