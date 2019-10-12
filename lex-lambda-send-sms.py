import boto3
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def close(session_attributes, fulfillment_state, message):
    response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }
    return response

def lambda_handler(event, context):
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    session_attributes = event['sessionAttributes'] if event['sessionAttributes'] is not None else {}
    intent_name = event['currentIntent']['name']
    account_type = event['currentIntent']['slots']['AccountType'].lower()
    phone_number = "+65{}".format(event['currentIntent']['slots']['PhoneNumber'])

    balance = 0
    if account_type == 'saving':
        balance = 10000
    elif account_type == 'current':
        balance = 50000

    client = boto3.client('sns')
    client.publish(
        PhoneNumber = phone_number,
        Message='Your {} account balance is ${}.'.format(account_type, balance),
        MessageAttributes={
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': 'Pbanker'
            }
        }
    )

    return close(
		session_attributes,
        'Fulfilled',
        {
            'contentType': 'PlainText',
            'content': "Message is sent!"
        }
	)
