'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { firestore, auth } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Webcam from 'react-webcam';
import { Configuration, OpenAIApi } from 'openai';
import OpenAI from 'openai';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const Home = () => {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const webcamRef = useRef(null);

  const categories = ['All', 'Food', 'Electronics', 'Clothing', 'Books'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateInventory(user.uid);
      } else {
        setUser(null);
        setInventory([]);
      }
    });
    return unsubscribe;
  }, []);

  const updateInventory = async (userId) => {
    try {
      const snapshot = query(collection(firestore, 'inventory', userId, 'items'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        const data = doc.data();
        inventoryList.push({ id: doc.id, ...data });
      });
      console.log('Fetched Inventory:', inventoryList);
      // Sort items by category
      inventoryList.sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return 0;
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const addItem = async () => {
    if (!user || !itemName) return; // Ensure itemName is not empty
    try {
      const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), itemName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity, category } = docSnap.data();
        await setDoc(docRef, { name: itemName, quantity: quantity + 1, category: itemCategory });
      } else {
        await setDoc(docRef, { name: itemName, quantity: 1, category: itemCategory });
      }
      await updateInventory(user.uid);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeItem = async (itemId) => {
    if (!user) return;
    try {
      const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), itemId);
      await deleteDoc(docRef);
      await updateInventory(user.uid);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setItemCategory('');
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
        setError('');
      })
      .catch((error) => {
        console.error('Error signing in:', error);
        if (error.code === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else if (error.code === 'auth/wrong-password') {
          setError('Incorrect password.');
        } else if (error.code === 'auth/user-not-found') {
          setError('No user found with this email.');
        } else {
          setError('Failed to sign in. Please check your credentials.');
        }
      });
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
      setInventory([]);
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  const filteredInventory = inventory.filter(item => {
    return (
      (categoryFilter === '' || categoryFilter === 'All' || item.category === categoryFilter) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const exportToPDF = (data) => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Name", "Quantity", "Category"];
    const tableRows = [];

    data.forEach(item => {
      const itemData = [
        item.id,
        item.name,
        item.quantity,
        item.category,
      ];
      tableRows.push(itemData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Inventory Report", 14, 15);
    doc.save(`inventory_report.pdf`);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  }, [webcamRef, setImageSrc]);

  const classifyImage = async (imageSrc) => {
    const response = await fetch('/api/classifyImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageSrc }),
    });

    const data = await response.json();
    if (response.ok) {
        return data.result;
    } else {
        console.error('Error:', data.error);
    }
};


  const handleClassify = async () => {
    if (!imageSrc || !itemName) return;
    const result = await classifyImage(imageSrc);
    console.log('Classification Result:', result);
    const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), itemName);
    await setDoc(docRef, { ...doc.data(), classification: result });
  };

  const handleWebcamToggle = () => {
    setWebcamOpen(!webcamOpen);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor="background.default"
      color="text.primary"
      p={2}
      overflow="auto"
    >
      <Box mb={2}>
        {user ? (
          <Button variant="contained" onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <Box>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              color="primary"
              InputProps={{
                style: { color: 'black' },
              }}
              InputLabelProps={{
                style: { color: 'black' },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              color="primary"
              InputProps={{
                style: { color: 'black' },
              }}
              InputLabelProps={{
                style: { color: 'black' },
              }}
            />
            <Button variant="contained" onClick={handleSignIn}>
              Sign In
            </Button>
            {error && <Typography color="error">{error}</Typography>}
          </Box>
        )}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              InputProps={{
                style: { color: 'black' },
              }}
              InputLabelProps={{
                style: { color: 'black' },
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={itemCategory}
                label="Category"
                onChange={(e) => setItemCategory(e.target.value)}
                style={{ color: 'black' }}
              >
                {categories.slice(1).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                addItem();
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box mb={2} display="flex" width="80%" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginRight: '10px' }}
          InputProps={{
            style: { color: 'black' },
          }}
          InputLabelProps={{
            style: { color: 'black' },
          }}
        />
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="category-filter-label">Filter by Category</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Filter by Category"
            style={{ color: 'black' }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Button variant="contained" onClick={handleOpen} disabled={!user}>
        Add New Item
      </Button>
      <Button variant="contained" onClick={() => exportToPDF(inventory)} disabled={!user} style={{ marginTop: '10px' }}>
        Export to PDF
      </Button>
      <CSVLink data={inventory} headers={["id", "name", "quantity", "category"]} filename={"inventory.csv"}>
        <Button variant="contained" disabled={!user} style={{ marginTop: '10px' }}>
          Export to CSV
        </Button>
      </CSVLink>
      <Button variant="contained" onClick={handleWebcamToggle} style={{ marginTop: '10px' }}>
        {webcamOpen ? 'Close Webcam' : 'Open Webcam'}
      </Button>
      {webcamOpen && (
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
          <Button onClick={capture} style={{ marginTop: '10px' }}>Capture photo</Button>
          {imageSrc && (
            <img src={imageSrc} alt="captured" style={{ marginTop: '10px' }} />
          )}
          <Button onClick={handleClassify} disabled={!imageSrc} style={{ marginTop: '10px' }}>Classify Image</Button>
        </Box>
      )}
      <Box border={'1px solid #333'} borderRadius={2} width="80%" mt={2}>
        <Box
          width="100%"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius="8px 8px 0 0"
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" height="300px" spacing={2} overflow={'auto'} p={2}>
          {filteredInventory.map(({ id, name, quantity, category }) => (
            <Box
              key={id}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              borderRadius={2}
              mb={2}
            >
              <Box>
                <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                  {name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unnamed Item'}
                </Typography>
                <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                  Category: {category ? category : 'No Category'}
                </Typography>
              </Box>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" color="secondary" onClick={() => removeItem(id)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;