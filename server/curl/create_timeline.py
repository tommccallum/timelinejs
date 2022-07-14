#!/usr/bin/env python3

import json
import requests
import sys

def exit_on_error(response):
    body = json.loads(response.text)
    if isinstance(body, dict):
        if "error" in body:
            if body["error"]:
                print("Received error from server: {}".format(body["error"]))
                sys.exit(1)
    
def print_response(response):
    print("Received HTTP code: {}".format(response.status_code))
    body = json.loads(r.text)
    print(body)
    
url = "http://localhost:8000"
payload = {
    "action": "new_session"
}
headers = { 'Content-Type': 'application/json', 'Accept-Charset': 'UTF-8'}
r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)
body = json.loads(r.text)

token = body['token']
session = body['data']['session']
timeline = {
    "name": "New Timeline"
}

payload = {
    "token": token,
    "session": session,
    "action": "create_timeline",
    "timeline": timeline,
}

r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)

body = json.loads(r.text)
payload = {
    "token": body['token'],
    "session": body['data']['session'],
    "action": "get_session"
}
headers = { 'Content-Type': 'application/json', 'Accept-Charset': 'UTF-8'}
r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)



payload = {
    "token": token,
    "session": session,
    "action": "delete_timeline",
    "timeline": {
        "name": "New Timeline",
        "index": 0
    },
}

r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)

body = json.loads(r.text)
payload = {
    "token": body['token'],
    "session": body['data']['session'],
    "action": "get_session"
}
headers = { 'Content-Type': 'application/json', 'Accept-Charset': 'UTF-8'}
r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)


# try and delete the same timeline twice
payload = {
    "token": token,
    "session": session,
    "action": "delete_timeline",
    "timeline": {
        "name": "New Timeline",
        "index": 0
    },
}

r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)

body = json.loads(r.text)
payload = {
    "token": body['token'],
    "session": body['data']['session'],
    "action": "get_session"
}
headers = { 'Content-Type': 'application/json', 'Accept-Charset': 'UTF-8'}
r = requests.post(url, data=json.dumps(payload), headers=headers)
exit_on_error(r)
print_response(r)






