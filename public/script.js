//animation form

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('applicantForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // stop the actual submission

        form.classList.add('hide'); // trigger the hiding animation
    });
});


// form logic

document.getElementById("applicantForm").addEventListener("submit", function(e) {
    e.preventDefault();
  
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
  
    // Client-side validation
    if (!validateForm(firstName, lastName)) {
      return; // exit early if the form isn't valid
    }
  
    // Send data to the backend server
    fetch("/createApplicant", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName }),
    })
    .then(response => response.json())
    .then(data => {
      let resultsDiv = document.getElementById('results');
        if (data && data.sdkToken) {
            // Initialize Onfido with returned SDK token
            Onfido.init({
                token: data.sdkToken,
                onComplete: function (data) {
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
                
                // Display the result on the frontend
                document.getElementById('results').textContent = outputMessage;
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
                      forceCrossDevice: true // Forcing to use the mobile device.
                    }
                  },
                  {
                    type: 'face',
                    options: {
                      requestedVariant: 'motion' // Enabling motion capture only
                    }
                  },
                  'complete'
                ],
            });
        } else {
            console.error('Failed to get the SDK token from the server.');
        }
    })
    .catch(error => {
        console.error('Error while fetching data:', error);
    });
  });
  
  // Validation function
  function validateForm(firstName, lastName) {
    if (!firstName.trim() || !lastName.trim()) {
        alert("First Name and Last Name are required!");
        return false;
    }
    return true;
  }