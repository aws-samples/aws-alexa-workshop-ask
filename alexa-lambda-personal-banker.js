// --------------- Helpers that build all of the responses -----------------------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: 'SSML',
      ssml: output,
    },
    card: {
      type: 'Simple',
      title: `SessionSpeechlet - ${title}`,
    },
    reprompt: {
      outputSpeech: {
        type: 'PlainText',
        text: repromptText,
      },
    },
    shouldEndSession,
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: '1.0',
    sessionAttributes,
    response: speechletResponse,
  };
}



// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
  console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

// Dispatch to your skill's launch.
  getWelcomeResponse(callback);
}

function getWelcomeResponse(callback) {
  /* If we wanted to initialize the session to have some attributes we could add those here.*/
  const sessionAttributes = {};
  const cardTitle = 'Welcome';
  const speechOutput = '<speak>  <prosody rate="90%"> <prosody pitch="high"> Welcome to Personal Banker </prosody></prosody><break time="2s"/> <prosody rate="90%"> <prosody pitch="high"> to know about your account detail, say what is my saving account balance? or what is my checking account balance?" <break time="1s"/> To hear know about loan product, say what is the rate of home/car loan?</prosody></prosody></speak>' ;
  /* If the user either does not reply to the welcome message or says something that is not understood, they will be prompted again with this text.*/
  const repromptText = 'Say something, I did not get it' ;
  const shouldEndSession = false;

  callback(sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
  console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

  const intent = intentRequest.intent;
  const intentName = intentRequest.intent.name;


// Dispatch to your skill's intent handlers
  if (intentName === 'AMAZON.HelpIntent') {
    getWelcomeResponse(callback);
  } else if (intentName === 'AMAZON.StopIntent') {
    handleSessionEndRequest(callback);
  } else if (intentName === 'GetLoanProducts') {
    var LoanType = intent.slots.LoanType.value;
    var sessionAttributes = {};
    var cardTitle = 'LoanProduct';
    var repromptText = '' ;
    const shouldEndSession = false;
    var LoanType = intent.slots.LoanType.value;
    if (LoanType == 'car'){
      speechOutput = '<speak>The current rate for car loan is 0.04%. Say Account Balance to know your account. Or say Loan balance to know your loan balance. </speak>';
    } else if (LoanType == 'home') {
      speechOutput = '<speak>The current rate for home loan is 0.03%. Say Account Balance to know your account. Or say Loan balance to know your loan balance.</speak>';
    }   else {
      speechOutput = 'Sorry. You should say what is the rate of home or car loan?</speak>'
    }
    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
  } else if (intentName === 'GetLoanDetail') {
    var LoanType = intent.slots.LoanType.value;
    var sessionAttributes = {};
    var cardTitle = 'LoanDetail';
    var repromptText = '' ;
    const shouldEndSession = false;
    var LoanType = intent.slots.LoanType.value;
    if (LoanType == 'car'){
      speechOutput = '<speak>You car loan balance is 35 thousands, and your current rate is 0.05%.  To know more about your home loan detail, say home. Or say Account Balance to know your account. Or say Loan product to know about loan product. </speak>';
    } else if (LoanType == 'home'){
      speechOutput = '<speak>You home loan balance is 1.2 millon, and your current rate is 0.035%.  To know more about the car loan detail, say car. Or say Account Balance to know your account. Or say Loan product to know about loan product. </speak>';
    } else {
      speechOutput = '<speak>Sorry, you should say what is my car loan balance or what is my home loan balance?</speak>'
    }
    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
  } else if (intentName === 'GetAccountDetail'){
    var AccountType = intent.slots.AccountType.value;
    var sessionAttributes = {};
    var cardTitle = 'AccountDetail';
    var repromptText = '' ;
    const shouldEndSession = false;
    var speechOutput = '' ;
    if (AccountType == 'checking'){
      speechOutput = '<speak>Your checking account balance is five thousand. To know more about the saving account balance, say saving. Or say loan balance to know your loan balance. Or say Loan product to know about loan product.</speak>';
    } else if (AccountType == 'saving'){
      speechOutput = '<speak>Your saving account balance is ten thousand. To know more about the checking account balance, say checking. Or say loan balance to know your loan balance. Or say Loan product to know about loan product.</speak>';
    } else {
      speechOutput = '<speak>Sorry, you should say what is my checking account balance or what is my saving account balance</speak>'
    }
    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
  }

}

function handleSessionEndRequest(callback) {
  const cardTitle = 'Session Ended';
  const speechOutput = '<speak> <prosody rate="90%">  <prosody pitch="high">Thank you   <emphasis level="strong"> very much </emphasis> </prosody> </prosody>  </speak>';
  // Setting this to true ends the session and exits the skill.
  const shouldEndSession = true;

  callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
  console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
  // Add cleanup logic here
}

// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
  try {
    console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

    /**
     * Uncomment this if statement and populate with your skill's application ID to
     * prevent someone else from configuring a skill that sends requests to this function.
     */
    /*
    if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
         callback('Invalid Application ID');
    }
    */

    if (event.session.new) {
      onSessionStarted({ requestId: event.request.requestId }, event.session);
    }

    if (event.request.type === 'LaunchRequest') {
      onLaunch(event.request,
        event.session,
        (sessionAttributes, speechletResponse) => {
          callback(null, buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === 'IntentRequest') {
      onIntent(event.request,
        event.session,
        (sessionAttributes, speechletResponse) => {
          callback(null, buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === 'SessionEndedRequest') {
      onSessionEnded(event.request, event.session);
      callback();
    }
  } catch (err) {
    callback(err);
  }
};