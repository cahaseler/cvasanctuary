---
layout: layouts/contact.njk
title: Contact and Hours
permalink: /contact-us/
hero:
  title: Contact and Hours
contactInfo:
  address:
    street: 501 Old Arden Hwy
    city: Colville
    state: WA
    zip: 99114
  phone: 509-684-1475
  email: office@cvasanctuary.org
  note: Please leave a message if we are unable to answer and we will return your call as soon as possible
hours:
  title: Hours of Operation
  text: We are currently open by appointment only Tuesday through Saturday
  days: Tuesday through Saturday
  time: 10:00am-3:00pm
  appointment: Please contact us for an appointment.
  closed: Our office is closed to the public on Sunday and Monday.
contactForm:
  title: Send Us a Message
  fields:
    - name: name
      label: Name
      type: text
      required: true
      placeholder: First and Last
    - name: email
      label: Email Address
      type: email
      required: true
      placeholder: your@email.com
    - name: phone
      label: Phone Number
      type: tel
      required: false
      placeholder: (xxx) xxx-xxxx
    - name: subject
      label: Subject
      type: text
      required: true
      placeholder: How can we help?
    - name: location
      label: Where Do You Live
      type: text
      required: false
      placeholder: City, County
    - name: message
      label: Message
      type: textarea
      required: true
      placeholder: Your message here...
  submitText: Send Message
  thankYouMessage: Thank you!
---