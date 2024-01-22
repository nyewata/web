// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LibraryManagementSystem {
    address public owner;
    uint256 public defaultPenaltyAmount;

    struct Book {
        uint256 id;
        string title;
        string author;
        bool available;
    }

    struct BookHistory {
        bool borrowed;
        uint256 borrowTimestamp;
        uint256 returnTimestamp;
    }

    mapping(uint256 => Book) public books;
    mapping(uint256 => mapping(address => BookHistory)) public bookBorrowHistory;
    mapping(address => bool) public authenticatedUsers;
    uint256 public bookCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyAuthenticatedUser() {
        require(authenticatedUsers[msg.sender], "User is not authenticated");
        _;
    }

    event BookAdded(uint256 bookId, string title, string author);
    event BookBorrowed(uint256 bookId, string title, uint256 borrowTimestamp);
    event BookReturned(uint256 bookId, string title, uint256 borrowTimestamp, uint256 returnTimestamp);
    event PenaltyCalculated(address borrower, uint256 bookId, string title, uint256 penaltyAmount);
    event PenaltySet(uint256 newPenaltyAmount);
    event UserAuthenticated(address user);
    event UserDeauthenticated(address user);

    constructor() {
        owner = msg.sender;
        defaultPenaltyAmount = 0; // Default penalty amount is zero
        authenticateUser(owner); // Owner is automatically authenticated
    }

    function addBookByLibrarian(string memory _title, string memory _author) public onlyOwner {
        bookCount++;
        books[bookCount] = Book(bookCount, _title, _author, true);
        emit BookAdded(bookCount, _title, _author);
    }

    function authenticateUser(address _user) public onlyOwner {
        authenticatedUsers[_user] = true;
        emit UserAuthenticated(_user);
    }

    function deauthenticateUser(address _user) public onlyOwner {
        authenticatedUsers[_user] = false;
        emit UserDeauthenticated(_user);
    }

    function borrowBook(string memory _searchCriteria, uint256 _borrowDuration) public onlyAuthenticatedUser {
        uint256 bookId = findBook(_searchCriteria);
        require(bookId > 0, "Book not found");
        require(books[bookId].available, "Book is not available for borrowing");

        books[bookId].available = false;
        bookBorrowHistory[bookId][msg.sender].borrowed = true;
        bookBorrowHistory[bookId][msg.sender].borrowTimestamp = block.timestamp;
        emit BookBorrowed(bookId, books[bookId].title, block.timestamp);

        // Calculate and charge penalty if book is returned late
        calculateAndChargePenalty(bookId, _borrowDuration);
    }

    function returnBook(string memory _searchCriteria) public onlyAuthenticatedUser {
        uint256 bookId = findBook(_searchCriteria);
        require(bookId > 0, "Book not found");
        require(!books[bookId].available, "Book is not borrowed");

        bookBorrowHistory[bookId][msg.sender].returnTimestamp = block.timestamp;

        // Calculate and charge penalty if book is returned late
        calculateAndChargePenalty(bookId, 0);

        books[bookId].available = true;
        emit BookReturned(bookId, books[bookId].title, bookBorrowHistory[bookId][msg.sender].borrowTimestamp, block.timestamp);
    }

    function calculateAndChargePenalty(uint256 _bookId, uint256 _borrowDuration) internal {
        uint256 borrowTimestamp = bookBorrowHistory[_bookId][msg.sender].borrowTimestamp;
        require(borrowTimestamp > 0, "User did not borrow this book.");

        uint256 borrowDuration = block.timestamp - borrowTimestamp;
        uint256 penaltyAmount = calculatePenalty(borrowDuration, _borrowDuration);

        if (penaltyAmount > 0) {
            // Charge penalty
            payable(owner).transfer(penaltyAmount);
            emit PenaltyCalculated(msg.sender, _bookId, books[_bookId].title, penaltyAmount);
        }
    }

    function calculatePenalty(uint256 _borrowDuration, uint256 _specifiedBorrowDuration) internal view returns (uint256) {
        // Use the specified borrow duration if provided, otherwise use the default duration
        uint256 borrowDuration = (_specifiedBorrowDuration > 0) ? _specifiedBorrowDuration : defaultPenaltyAmount;

        // Assuming penalty is 0.1 ether for each day exceeded
        uint256 daysExceeded = _borrowDuration / borrowDuration;

        if (daysExceeded > 0) {
            return daysExceeded * 1e17; // 0.1 ether in wei
        } else {
            return 0;
        }
    }

    function setPenaltyAmount(uint256 _newPenaltyAmount) public onlyOwner {
        defaultPenaltyAmount = _newPenaltyAmount;
        emit PenaltySet(_newPenaltyAmount);
    }

    function getBorrowHistory() public view returns (BookHistory[] memory) {
        BookHistory[] memory history;
        uint256 count;

        for (uint256 i = 1; i <= bookCount; i++) {
            if (bookBorrowHistory[i][msg.sender].borrowed) {
                history[count] = bookBorrowHistory[i][msg.sender];
                count++;
            }
        }

        return history;
    }

    function searchBorrowHistory(string memory _searchCriteria) public view returns (BookHistory[] memory) {
        BookHistory[] memory searchResults;
        uint256 count;

        for (uint256 i = 1; i <= bookCount; i++) {
            // Assuming search is based on book titles
            if (
                (bytes(books[i].title).length > 0 &&
                    containsIgnoreCase(books[i].title, _searchCriteria) &&
                    bookBorrowHistory[i][msg.sender].borrowed) ||
                (bytes(books[i].author).length > 0 &&
                    containsIgnoreCase(books[i].author, _searchCriteria) &&
                    bookBorrowHistory[i][msg.sender].borrowed)
            ) {
                searchResults[count] = bookBorrowHistory[i][msg.sender];
                count++;
            }
        }

        return searchResults;
    }

    function findBook(string memory _searchCriteria) internal view returns (uint256) {
        for (uint256 i = 1; i <= bookCount; i++) {
            if (
                (bytes(books[i].title).length > 0 && containsIgnoreCase(books[i].title, _searchCriteria)) ||
                (bytes(books[i].author).length > 0 && containsIgnoreCase(books[i].author, _searchCriteria))
            ) {
                return i;
            }
        }
        return 0;
    }

    function containsIgnoreCase(string memory _str, string memory _subStr) internal pure returns (bool) {
        return (bytes(_str).length >= bytes(_subStr).length) &&
            (keccak256(abi.encodePacked(_str)) == keccak256(abi.encodePacked(_subStr)));
    }
}
