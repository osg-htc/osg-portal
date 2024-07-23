import {getFormData, validateForm} from '/static/js/form.mjs';

export const callback = (submissionSuccess, formData) => {
    if(submissionSuccess){
        submissionSuccessCallback(formData)
    } else {
        submissionFailureCallback(formData)
    }
}

export const submissionSuccessCallback = (formData) => {
    const successModalHtml = `
        <div id="success-modal" class="modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">We look forward to meeting with you!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>
                            Please check your inbox at <b id="user-email"></b> for an email which you can use
                            to follow up or adjust any provided information as needed.
                        </p>
                        <p>
                            You can expect our Research Facilitation team to <b>respond in 1 business day!</b>
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `

    const successModalNode = document.createElement("div")
    successModalNode.innerHTML = successModalHtml
    document.getElementsByTagName("body")[0].appendChild(successModalNode)

    const successModal = new bootstrap.Modal(document.getElementById('success-modal'))

    const userEmail = document.getElementById("user-email")
    userEmail.textContent = formData?.email?.value

    successModal.show()
}

export const submissionFailureCallback = (formData) => {
    const failureModalHtml = `
        <div id="failure-modal" class="modal" tabIndex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Application Submission Failed</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>
                            Your automatic application submission failed, please copy the below text and email it to
                            us at <a href="mailto:support@osg-htc.org">support@osg-htc.org</a> so that we can create a
                            ticket manually.
                        </p>
                        <div class="rounded bg-light p-2">
                            <pre id="form-information" class="text-black mb-0"></pre>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `

    const failureModalNode = document.createElement("div")
    failureModalNode.innerHTML = failureModalHtml
    document.getElementsByTagName("body")[0].appendChild(failureModalNode)

    const failureModal = new bootstrap.Modal(document.getElementById('failure-modal'))

    const formInformationNode = document.getElementById("form-information")
    const formInformation = Object.keys(formData)
        .filter(key => ['h-captcha-response', 'g-recaptcha-response'].indexOf(key) === -1)
        .reduce((currentValue, key) => {
            currentValue.push(`${formData[key]['label']}\r\n${formData[key]['value']}\r\n`)
            return currentValue
        }, [])
        .join('\r\n')
    formInformationNode.textContent = formInformation

    failureModal.show()
}


export const submitForm = async (e, form, bodyOptions, endpoint, callback) => {

    e.preventDefault()

    if(!validateForm(form)){ return; } // Validate the form

    const formData = getFormData(form)
    const description = formDataToFreshDescription(formData)
    const body = {
        "description": description,
        "email": formData['email']['value'],
        "name": formData['name']['value'],
        "h-captcha-response": formData['h-captcha-response']['value'],
        ...bodyOptions
    }

    let response;
    try {
        response = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json'
            }
        })
    } catch (e) {
        console.error(e)
    }

    if(callback){
        callback(response?.ok, formData)
    }

    if(!response?.ok){
        console.log(response?.error)
    }
}

export const formDataToFreshDescription = (formData) => {
    // Converts formdata to a freshdesk description field

    // Form keys that we shouldn't include in the freshticket description
    const skipKeys = new Set(["h-captcha-response", "g-recaptcha-response"])

    return Object.entries(formData).reduce((pv, [k, v]) => {

        if(skipKeys.has(k) || !v['label']){
            return pv
        }

        pv += `<h3>${v['label']}</h3>\n`
        pv += `<p>${v['value']}</p>\n`

        return pv
    }, "")
}
