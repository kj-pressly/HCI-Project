const form = document.getElementById("demographicsForm");
const result = document.getElementById("result");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const races = data.getAll("race");

  const summary = {
    fullName: data.get("fullName"),
    dob: data.get("dob"),
    sexAtBirth: data.get("sexAtBirth"),
    genderIdentity: data.get("genderIdentity"),
    language: data.get("language"),
    raceEthnicity: races,
    maritalStatus: data.get("maritalStatus"),
    employment: data.get("employment"),
    address: data.get("address"),
    emergencyContact: data.get("emergencyContact")
  };

  result.textContent = "Submitted. Thank you for completing the demographics form.";
  console.log("Survey submission:", summary);
});
