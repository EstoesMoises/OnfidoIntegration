document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('applicantForm');
  const resultsDiv = document.getElementById('results'); // constant storing results div from html
  
  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Stops the default form submission behaviour so that the custom logic below can work as expected
      
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      
      // Client-side validation (the html form requires those fields, if someone, by any reason it is bypassed, this script will still reject the form with an alert (which I will potentially change))
      if (!validateForm(firstName, lastName)) {
          return; // exit early if the form isn't valid
      }
      
      // Trigger the hiding animation by adding the 'hide' class to the form element, the .hide class contains a CSS rules that hides the form (xd)
      form.classList.add('hide');
      
      // Send data to the backend server via fetch API to the /createApplicant endpoint
      fetch("/createApplicant", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstName, lastName }),
      })
      .then(response => response.json()) // This will return a response that will be formated to JSON (the server sends a JSON response anyways)
      .then(data => InitiateOnfido(data, resultsDiv)) // I use a function that Handles the response, this function also initializes Onfido Web SDK (read the lines below for the function)
      .catch(error => {
          console.error('Error while fetching data:', error);
      });
  });
});

function validateForm(firstName, lastName) {
  if (!firstName.trim() || !lastName.trim()) {
      alert("First Name and Last Name are required!"); // Alerts are a bit intrusive, but I doubt someone will get to this
      return false;
  }
  return true;
}

function InitiateOnfido(data, resultsDiv) {
  if (data && data.sdkToken) { // Checks if the required data is present, otherwise will return an error. An SDK Token is needed to initialize Onfido Web SDK
      Onfido.init({
          token: data.sdkToken,
          onComplete: function(data) {
              let outputMessage;
              const documentFront = data.document_front;
              const documentBack = data.document_back;
              const motionId = data.face.id;

              if (documentFront && documentBack) {
                  outputMessage = `Two-sided document, Front ID: ${documentFront.id}, Back ID: ${documentBack.id}. MotionId: ${motionId}.`;
              } else {
                  outputMessage = `One-sided document, Document ID: ${documentFront.id}. MotionId: ${motionId}.`;
              }

              resultsDiv.textContent = outputMessage; // Sends results to the screen
              resultsDiv.style.display = "block";
          },
          steps: [{
                  type: 'welcome',
                  options: {
                      title: 'KYC Verification',
                  },
              },
              {
                  type: 'document',
                  options: {
                      forceCrossDevice: true
                  }
              },
              {
                  type: 'face',
                  options: {
                      requestedVariant: 'motion'
                  }
              },
              'complete'
          ],
      });
  } else {
      alert('Failed to get the SDK token from the server.'); // If it fails, you'll get the mythical unconventional alert
}
}
