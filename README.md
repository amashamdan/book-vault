Book Vault
==========

Welcome to Book Vault, where you can search for, add and trade books. Page built using Express JS, Mongo DB and Google Books API.

Features:
----------
As a user of Book Vault, you can do the following:

- Search for a book. The author can be used in the search to refine the results.
- Add books to your vault.
- View all books added by all users.
- Request, approve and decline trading requests.

Becoming a member of Book Vault:
----------
To become a Book Vault user, go to the Sign Up page and create an account. An email address can only be associated with one account.

Profile Page:
----------
The profile page displays the main information about the user: Name, Email, Address and the number of the book added.

To update your address, click on "Edit info" button then modify the fields as needed and click "Submit". You can cancel the process by clicking on "Cancel".

To change your password, click on "Change password" button, enter the new password, confirm it and click on "Submit". Click on "Cancel" to discard changes.

Dashboard page:
----------
The Dashboard page has the following sections:
- Book search.
- Trading requests.
- Added books.

### Searching and adding a book:
To search for a book, enter its title (required) and the author (optional for better results), and then click "Search".

The book is looked up using Google Books API. The results show infromation about each book found. 

The "More info" button redirects the user to an external link for more information about the book.

To add a book to your vault, click on "Add this book". The book now will be displayed in the Added books section at the bottom of Dashboard page.

### Incoming trading requests:
A history of the trading requests is shown in the Dashboard with the status of that request. If you approved an incoming request, you can email the other user or see their address by clicking on the corresponding buttons below the request status.

A pending incoming request means that a user sent you a request which awaits your approval. Click on "Approve" or "Decline" to approve or decline the incoming request.

### Outgoing trading requests:

Once you send a trade request to another user (explained in the following section), you can check the status of your request in the Outgoing requests section in the Dashboard.

If the status of the request is still pending, you can click on "Cancel request" to delete your request.

### Unavailable requests:
In the case a user deletes a book which is included in a pending request, the request will then appear with a status "Unavailable".

### Books added:

The last section in the Dashbaord is the Added books section. Here you can see a list of all you added books.

You can delete a book and remove it from your vault by clicking the "Delete" button. 

All books page:
--------------
This page displays the books added by all users. If more than one user added the book, it will still only appear once (more about that in the databse section).

The books which you already own will have a "You own it" button above it. To start a trade request with another user, click on "Trade" button.

### Creating a trade request:
To start a request, click on "Trade" in the All books page.
Note that you cannot start a request if don't have any books in your vault. If you don't have a book added, you will not be able to proceed with the request.

Once you click on "Trade", a window of your books will appear to select which book from your vault you want to trade in return for the book you requested. Select a book clicking on it.

After that, A list of all the users who own that book will appear. The address of each user is shown. Click on a user to complete the request.

Once the request is complete, you will see a confirmation message. To check the status of the request, head to the Dashboard and look it up in the Outgoing requests section.

Database:
------------

The database is MongoDB. It has three collections: users, shelf and requests.

The users collection has all the users. Each user document is constructed as follows:

`
{

    "name": name,
    "email": email,
    "password": hashed password,
    "address": address,
    "city": city,
    "state": state,
    "zip": zip code,
    "booksAdded": number,
    "books": [// isbns],
    "incomingRequests": [// incoming requests IDs],
    "outgoingRequests": [// outgoing requests IDs]
}`

The email address is unique for each user and used to look up the user.
Note that books array is an array of isbn codes.
Both requests arrays are lists of requestIDs only.

The shelf collection has a list of all the books added by all users, each book document looks as follows:
`
{

    "owners": [// A list of emails of all the users],
    "title": title,
    "link": more information link,
    "image": book cover link,
    "authors": author,
    "categories": categories,
    "pages": number of pages,
    "description": description,
    "isbn": isbn code
}`

Each book is identified by its isbn which is unique.
To avoid duplication in All Books page, if a user adds/removes a books which is already owned by another user, the email of the new user is added to or removed from the book's document instead of creating or removing a whole document.

The requests collection has all the requests, each request documents looks as follows:
`
{

    "requestID": requestID,
    "requestedBook": {
        "isbn": idbn,
        "title": title
    },
    "tradedBook": {
        "isbn": isbn,
        "title": title
    },
    "requestedBy": {
        "name": name,
        "email": email
    },
    "requestedFrom": {
        "name": name,
        "email": email
    },
    "status": status
}`

The requestID is created by combining the isbn codes of the two books included in the trade.

`Copyright © Book Vault 2016. All Rights Reserved`