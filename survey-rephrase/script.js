const surveyQuestions = [
  {
    id: "fullName",
    text: "1. What is your legal full name?",
    type: "text",
    required: true
  },
  {
    id: "dob",
    text: "2. What is your date of birth?",
    type: "date",
    required: true
  },
  {
    id: "sexAtBirth",
    text: "3. What sex were you assigned at birth?",
    type: "select",
    required: true,
    options: ["Female", "Male", "Intersex", "Prefer not to say"]
  },
  {
    id: "genderIdentity",
    text: "4. What is your current gender identity?",
    type: "select",
    required: true,
    options: ["Woman", "Man", "Non-binary", "Another identity", "Prefer not to say"]
  },
  {
    id: "language",
    text: "5. What is your preferred language for care?",
    type: "text",
    required: true
  },
  {
    id: "race",
    text: "6. Which race/ethnicity options describe you? (Select all that apply)",
    type: "checkbox",
    required: false,
    options: [
      "American Indian or Alaska Native",
      "Asian",
      "Black or African American",
      "Hispanic or Latino",
      "Native Hawaiian or Other Pacific Islander",
      "White",
      "Prefer not to say"
    ]
  },
  {
    id: "maritalStatus",
    text: "7. What is your marital status?",
    type: "select",
    required: true,
    options: ["Single", "Married", "Partnered", "Divorced", "Widowed", "Prefer not to say"]
  },
  {
    id: "employment",
    text: "8. What is your employment status?",
    type: "select",
    required: true,
    options: [
      "Employed full-time",
      "Employed part-time",
      "Self-employed",
      "Student",
      "Unemployed",
      "Retired",
      "Unable to work"
    ]
  },
  {
    id: "address",
    text: "9. What is your home address?",
    type: "text",
    required: true
  },
  {
    id: "emergencyContact",
    text: "10. Who is your emergency contact (name and phone number)?",
    type: "text",
    required: true
  }
];

const form = document.getElementById("surveyForm");
const submitBtn = document.getElementById("submitBtn");
const result = document.getElementById("result");
const localRephraseCounts = {};

function renderSurvey() {
  surveyQuestions.forEach((question, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question";

    const head = document.createElement("div");
    head.className = "question-head";

    const promptEl = document.createElement("p");
    promptEl.className = "prompt";
    promptEl.id = `prompt-${question.id}`;
    promptEl.textContent = question.text;

    const rephraseBtn = document.createElement("button");
    rephraseBtn.type = "button";
    rephraseBtn.className = "rephrase-btn";
    rephraseBtn.textContent = "Rephrase";
    rephraseBtn.addEventListener("click", () => rephraseQuestion(question, promptEl, rephraseBtn));

    head.appendChild(promptEl);
    head.appendChild(rephraseBtn);
    wrapper.appendChild(head);

    const inputEl = buildInput(question, index);
    wrapper.appendChild(inputEl);

    const aiAssistWrap = document.createElement("div");
    aiAssistWrap.className = "ai-assist";

    const aiInput = document.createElement("input");
    aiInput.type = "text";
    aiInput.className = "ai-input";
    aiInput.placeholder = "Type a short clarifying question...";
    aiInput.setAttribute("aria-label", `Ask AI about question ${index + 1}`);

    const aiAskBtn = document.createElement("button");
    aiAskBtn.type = "button";
    aiAskBtn.className = "rephrase-btn ai-ask-btn";
    aiAskBtn.textContent = "Ask AI";

    const aiResponseEl = document.createElement("p");
    aiResponseEl.className = "ai-response";
    aiResponseEl.hidden = true;

    aiAskBtn.addEventListener("click", () => askClarifyingQuestion(question, aiInput, aiResponseEl, aiAskBtn));
    aiInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        askClarifyingQuestion(question, aiInput, aiResponseEl, aiAskBtn);
      }
    });

    aiAssistWrap.appendChild(aiInput);
    aiAssistWrap.appendChild(aiAskBtn);
    wrapper.appendChild(aiAssistWrap);
    wrapper.appendChild(aiResponseEl);

    form.appendChild(wrapper);
  });
}

function buildInput(question, index) {
  if (question.type === "select") {
    const select = document.createElement("select");
    select.name = question.id;
    select.required = question.required;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select one";
    select.appendChild(defaultOption);

    question.options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });

    return select;
  }

  if (question.type === "checkbox") {
    const group = document.createElement("div");
    group.className = "checkbox-group";

    question.options.forEach((opt) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = `${question.id}[]`;
      checkbox.value = opt;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(opt));
      group.appendChild(label);
    });

    return group;
  }

  const input = document.createElement("input");
  input.type = question.type;
  input.name = question.id;
  input.required = question.required;
  input.id = `${question.id}-${index}`;
  return input;
}

async function rephraseQuestion(question, promptEl, buttonEl) {
  const originalText = question.text;
  buttonEl.disabled = true;
  buttonEl.textContent = "Rephrasing...";

  try {
    const newText = localRephrase(question);

    if (newText) {
      promptEl.textContent = newText;
    }
  } catch (error) {
    console.error(error);
    alert(`Could not rephrase: ${error.message}`);
  } finally {
    buttonEl.disabled = false;
    buttonEl.textContent = "Rephrase";
  }
}

function localRephrase(question) {
  const variantsById = {
    fullName: [
      "Please enter your full legal name.",
      "What is your complete legal name?",
      "Can you provide the full legal name on your ID?",
      "Share your full legal name as you want it on your record."
    ],
    dob: [
      "Please provide your date of birth.",
      "What is your birth date?",
      "Can you enter the date you were born?",
      "Please tell us your date of birth."
    ],
    sexAtBirth: [
      "Which sex were you assigned at birth?",
      "What sex was listed at birth?",
      "Please select your sex assigned at birth.",
      "At birth, what sex were you assigned?"
    ],
    genderIdentity: [
      "How do you currently describe your gender identity?",
      "Please select your current gender identity.",
      "What gender identity do you currently use?",
      "How would you like your gender identity recorded today?"
    ],
    language: [
      "Which language do you prefer for your care?",
      "What language would you like us to use when communicating with you?",
      "Please tell us your preferred language for medical care.",
      "Which language is best for your visits?"
    ],
    race: [
      "Which race or ethnicity options apply to you? (Select all that apply)",
      "Please choose the race or ethnicity options that describe you. (Select all that apply)",
      "What race or ethnicity categories fit you? (Select all that apply)",
      "Select all race/ethnicity options that you identify with."
    ],
    maritalStatus: [
      "What is your current marital status?",
      "Please select your marital status.",
      "How would you describe your marital status today?",
      "Tell us your marital status."
    ],
    employment: [
      "What is your current employment status?",
      "Please select the option that best matches your employment status.",
      "How would you describe your work status right now?",
      "Tell us your employment status."
    ],
    address: [
      "What is your current home address?",
      "Please provide your home address.",
      "Where do you currently live?",
      "Enter the home address you want on file."
    ],
    emergencyContact: [
      "Who should we contact in an emergency? Please include name and phone number.",
      "Please provide your emergency contact’s name and phone number.",
      "Who is your emergency contact, and what is their phone number?",
      "Share the name and phone number of someone we can call in an emergency."
    ]
  };

  const variants = variantsById[question.id] || [question.text.replace(/^\d+\.\s*/, "")];
  const count = localRephraseCounts[question.id] || 0;
  localRephraseCounts[question.id] = count + 1;
  return variants[count % variants.length];
}

async function askClarifyingQuestion(question, inputEl, aiResponseEl, buttonEl) {
  const trimmedPrompt = inputEl.value.trim();
  if (!trimmedPrompt) {
    inputEl.focus();
    return;
  }

  buttonEl.disabled = true;
  buttonEl.textContent = "Thinking...";

  try {
    const answer = localClarify(question, trimmedPrompt);
    aiResponseEl.hidden = false;
    aiResponseEl.textContent = `AI: ${answer}`;
    inputEl.value = "";
  } finally {
    buttonEl.disabled = false;
    buttonEl.textContent = "Ask AI";
  }
}

function localClarify(question, userPrompt) {
  const promptLower = userPrompt.toLowerCase();
  const mentionsExample = /example|format|sample|how do i write|how should i write|template/.test(promptLower);
  const asksWhy = /why|need this|required|purpose|reason/.test(promptLower);
  const asksPrivacy = /private|privacy|secure|shared|confidential|hipaa|safe/.test(promptLower);
  const asksSkip = /skip|optional|have to|must i|required\?|do i need/.test(promptLower);
  const asksInterpreter = /translator|interpreter|translation|spanish|language help/.test(promptLower);
  const asksSelectAll = /select all|multiple|more than one|pick more than one/.test(promptLower);

  if (asksInterpreter) {
    if (question.id === "language") {
      return "Many clinics can arrange interpreter services. Add your preferred language here, then ask the front desk if an in-person or phone interpreter is available.";
    }
    return "If you need language support, note your preferred language on the form and ask clinic staff for interpreter services.";
  }

  if (asksSelectAll && question.id === "race") {
    return "Yes — for race/ethnicity you can choose more than one option if multiple categories apply to you.";
  }

  if (asksPrivacy) {
    return "This info is usually used for care, safety, and records. For exact privacy rules at this clinic, ask staff who can view your data and how it is protected.";
  }

  if (asksSkip) {
    const requiredById = {
      race: false
    };
    const required = requiredById[question.id] ?? true;
    return required
      ? "This item is marked as required in this form. If you’re uncomfortable answering, ask clinic staff for guidance."
      : "This item is optional in this form, so you can leave it blank if you prefer.";
  }

  if (asksWhy) {
    return "This question helps the clinic keep accurate records and provide care that matches your needs.";
  }

  if (mentionsExample) {
    const examplesById = {
      fullName: "Example: Jordan Lee Martinez.",
      dob: "Example format: MM/DD/YYYY or use the date picker.",
      sexAtBirth: "Select the option listed on your birth record.",
      genderIdentity: "Choose the identity that best reflects how you currently identify.",
      language: "Example: English, Spanish, Vietnamese, or another preferred language.",
      race: "You can select more than one option if multiple categories apply.",
      maritalStatus: "Choose the status that best matches your current legal or personal status.",
      employment: "Pick the option that best reflects your current work situation.",
      address: "Example: 123 Main St, Apt 4B, Atlanta, GA 30303.",
      emergencyContact: "Example: Alex Kim, 555-123-4567."
    };
    return examplesById[question.id] || "Use the format that best matches your current information.";
  }

  const clarifiersById = {
    fullName: "Enter your legal name as it appears on official documents.",
    dob: "Use your birth date, not today’s date.",
    sexAtBirth: "This is usually the sex recorded at birth and may differ from gender identity.",
    genderIdentity: "This question asks how you identify currently.",
    language: "Choose the language you prefer for speaking and written medical communication.",
    race: "You may select all options that describe you.",
    maritalStatus: "Choose the option that best matches your current status.",
    employment: "Select your current employment situation, even if temporary.",
    address: "Provide the home address where you currently live.",
    emergencyContact: "Share someone we should contact if there is an urgent medical need."
  };

  const base = clarifiersById[question.id] || "Please answer with the information that best matches your current situation.";
  return `For your question "${userPrompt}", here’s the best guidance: ${base}`;
}

submitBtn.addEventListener("click", () => {
  const controls = Array.from(form.querySelectorAll("input, select"));

  const missingRequired = controls.some((control) => {
    if (!control.required) {
      return false;
    }

    if (control.type === "checkbox") {
      return false;
    }

    return !control.value;
  });

  if (missingRequired) {
    result.textContent = "Please fill out all required fields before submitting.";
    return;
  }

  const formData = new FormData(form);
  const summary = {};

  surveyQuestions.forEach((question) => {
    if (question.type === "checkbox") {
      summary[question.id] = formData.getAll(`${question.id}[]`);
    } else {
      summary[question.id] = formData.get(question.id);
    }
  });

  console.log("Survey submission:", summary);
  result.textContent = "Submitted. Thank you for completing the demographics form.";
});

renderSurvey();
