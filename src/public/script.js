document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('applicantForm');
    const resultsDiv = document.getElementById('results');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // preventing default form submission behaviour
        
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        
        if (!validateForm(firstName, lastName, resultsDiv)) { // client-side validation, if the HTTP rule is somehow overriden this will prevent the form from being submitted and return an error.
            return;
        }
        
        form.classList.add('hide'); // if the form is valid, it will be hidden, and the logic below will start working.
        
        fetch("/createApplicant", { // communicating with the backend to create the applicant and SDK token
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstName, lastName }),
        })
        .then(response => {
          if (!response.ok) { // Validation of promise, if the respones is not ok it will throw an error with information about the error
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => InitiateOnfido(data, resultsDiv))
        .catch(error => {
          console.error('Error while fetching data:', error); // return information to the console abotu the error
          resultsDiv.textContent = "Error processing the data. Please try again!"; // Showing error on the screen
          resultsDiv.style.display = "block";
        });
    });
  });
  
  function validateForm(firstName, lastName, resultsDiv) { // If the form is invalid then the result will display information about the why
      if (!firstName.trim() || !lastName.trim()) {
          resultsDiv.textContent = "First Name and Last Name are required!";
          resultsDiv.style.display = "block";
          return false;
      }
      return true;
  }

async function getOnfidoConfigFromServer() { // Onfido config lies in on the backend to prevent that unwanted ways of OnfidoSDK used, we only want to receive requests according to our own settings, configured in routes/OnfidoSetup.js
    try {
        const response = await fetch("/getOnfidoConfig");
        return response.json();
    } catch (error) {
        console.error('Error fetching Onfido config:', error);
        return null;
    }
}

function mergeConfigs(config, sdkToken, resultsDiv) { // This will merge the config with the front end SDK
    return {
        ...config,
        token: sdkToken,
        onComplete: (data) => handleOnComplete(data, resultsDiv)
    };
}

function handleOnComplete(data, resultsDiv) { // On successful form complete, this will return the results with the IDs of the document to the user's screen.
    let outputMessage;
    const documentFront = data.document_front;
    const documentBack = data.document_back;
    const motionId = data.face.id;

    if (documentFront && documentBack) {
        outputMessage = `Two-sided document, Front ID: ${documentFront.id}, Back ID: ${documentBack.id}. MotionId: ${motionId}.`;
    } else {
        outputMessage = `One-sided document, Document ID: ${documentFront.id}. MotionId: ${motionId}.`;
    }

    resultsDiv.textContent = outputMessage;
    resultsDiv.style.display = "block";
}

async function InitiateOnfido(data, resultsDiv) {
    if (data && data.sdkToken) {
        const config = await getOnfidoConfigFromServer();

        if (config) {
            const onfidoConfig = mergeConfigs(config, data.sdkToken, resultsDiv); // Merges the config with help from the prevous function
            Onfido.init(onfidoConfig); // Initializes onfido using our config
        }
    } else {
        resultsDiv.textContent = 'Failed to get the SDK token from the server.'; // Showing error on the screen
        resultsDiv.style.display = "block";
    }
}
