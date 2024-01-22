import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
import { ethers, JsonRpcProvider } from 'ethers';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
} from '@mui/material';

const SmartContractInteraction = () => {
  // State variables for input fields, interaction result, and Snackbar
  const [searchCriteria, setSearchCriteria] = useState('');
  const [borrowDuration, setBorrowDuration] = useState(7);
  const [interactionResult, setInteractionResult] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Smart contract address and ABI
  const contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
  const contractABI =  [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_author",
                "type": "string"
            }
        ],
        "name": "addBookByLibrarian",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "authenticateUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bookId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "author",
                "type": "string"
            }
        ],
        "name": "BookAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bookId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowTimestamp",
                "type": "uint256"
            }
        ],
        "name": "BookBorrowed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bookId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowTimestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "returnTimestamp",
                "type": "uint256"
            }
        ],
        "name": "BookReturned",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_searchCriteria",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_borrowDuration",
                "type": "uint256"
            }
        ],
        "name": "borrowBook",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "deauthenticateUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "borrower",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bookId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "penaltyAmount",
                "type": "uint256"
            }
        ],
        "name": "PenaltyCalculated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newPenaltyAmount",
                "type": "uint256"
            }
        ],
        "name": "PenaltySet",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_searchCriteria",
                "type": "string"
            }
        ],
        "name": "returnBook",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_newPenaltyAmount",
                "type": "uint256"
            }
        ],
        "name": "setPenaltyAmount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "UserAuthenticated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "UserDeauthenticated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "authenticatedUsers",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "bookBorrowHistory",
        "outputs": [
            {
                "internalType": "bool",
                "name": "borrowed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "borrowTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "returnTimestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "bookCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "books",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "author",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "available",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "defaultPenaltyAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBorrowHistory",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "borrowed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "borrowTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "returnTimestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct LibraryManagementSystem.BookHistory[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_searchCriteria",
                "type": "string"
            }
        ],
        "name": "searchBorrowHistory",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "borrowed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "borrowTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "returnTimestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct LibraryManagementSystem.BookHistory[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

  // Ethereum provider, signer, and contract instances
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // Function to interact with the smart contract
  const interactWithSmartContract = async () => {
    try {
      // Check for valid input
      if (!searchCriteria || borrowDuration <= 0) {
        setInteractionResult('Please enter valid search criteria and borrow duration.');
        setSnackbarOpen(true);
        return;
      }

      // Call the smart contract function to borrow a book
      await contract.borrowBook(searchCriteria, borrowDuration);

      // Handle success
      setInteractionResult('Book borrowed successfully! Check your account for details.');
      setSnackbarOpen(true);
    } catch (error) {
      // Handle error
      setInteractionResult(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  // Event handlers for input field changes
  const handleSearchCriteriaChange = (event) => {
    setSearchCriteria(event.target.value);
  };

  const handleBorrowDurationChange = (event) => {
    setBorrowDuration(event.target.value);
  };

  // Event handler for the "Borrow Book" button click
  const handleInteractButtonClick = () => {
    interactWithSmartContract();
  };

  // Event handler for Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    // Additional initialization or side effects can be added here
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Library Management System
        </Typography>

        {/* Input field for book title */}
        <TextField
          label="Book Title"
          variant="outlined"
          margin="normal"
          fullWidth
          value={searchCriteria}
          onChange={handleSearchCriteriaChange}
        />

        {/* Input field for borrow duration */}
        <TextField
          label="Borrow Duration (days)"
          type="number"
          variant="outlined"
          margin="normal"
          fullWidth
          value={borrowDuration}
          onChange={handleBorrowDurationChange}
        />

        {/* Button to trigger smart contract interaction */}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
          onClick={handleInteractButtonClick}
        >
          Borrow Book
        </Button>

        {/* Display interaction result */}
        {interactionResult && (
          <Typography variant="body1" style={{ marginTop: '20px', textAlign: 'center' }}>
            {interactionResult}
          </Typography>
        )}

        {/* Snackbar for displaying messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={interactionResult}
        />
      </Paper>
    </Container>
  );
};

export default SmartContractInteraction;
