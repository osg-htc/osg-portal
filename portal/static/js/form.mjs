

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

export const getFormData = (form) => {
    // Grabs all the form data as a dictionary of input information key'd by name

    const FD = new FormData(form);
    return Array.from(FD).reduce((currentValue,[name, value]) => {
        let component = {
            name: name,
            value: value,
        }

        if(document.getElementById(name)){
            component["label"] = document.getElementById(name).labels[0].textContent.trim()
        }

        currentValue[name] = component

        return currentValue
    }, {})
}

