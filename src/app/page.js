'use client'

import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { firestore, auth } from '@/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Webcam from 'react-webcam';
import { Configuration, OpenAIApi } from 'openai';

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

  const categories = ['All', 'Food', 'Electronics', 'Clothing', 'Books', 'Other'];

  // const configuration = new Configuration({
  //   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  // });
  // const openai = new OpenAIApi(configuration);  

  const updateInventory = async () => {
    if (!user) return;
    const q = query(collection(firestore, 'inventory', user.uid, 'items'));
    const docs = await getDocs(q);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        updateInventory();
      } else {
        setUser(null);
        setInventory([]);
      }
    });
  }, []);

  const addItem = async (item, category) => {
    if (!user) return;
    const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { category, quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { category, quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    if (!user) return;
    const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { ...docSnap.data(), quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  };

  const classifyImage = async (imageSrc) => {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Classify this image: ${imageSrc}`,
      max_tokens: 100,
    });
    return response.data.choices[0].text.trim();
  };

  const handleClassify = async () => {
    if (!imageSrc || !itemName) return;
    const result = await classifyImage(imageSrc);
    console.log('Classification Result:', result);
    const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), itemName);
    await setDoc(docRef, { ...doc.data(), classification: result });
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Name', 'Category', 'Quantity']],
      body: inventory.map(item => [item.name, item.category, item.quantity]),
    });
    doc.save('inventory.pdf');
  };

  const handleExportToCSV = () => {
    // CSV export logic here
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      overflow="auto"
    >
      <Button variant="contained" onClick={handleSignOut}>Sign Out</Button>
      <Button variant="contained" onClick={() => setOpen(true)}>Add New Item</Button>
      <Button variant="contained" onClick={handleExportToPDF}>Export to PDF</Button>
      <Button variant="contained" onClick={handleExportToCSV}>Export to CSV</Button>

      {webcamOpen && (
        <Box>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
          <Button variant="contained" onClick={handleCapture}>Capture Photo</Button>
          {imageSrc && <img src={imageSrc} alt="Captured" />}
          <Button variant="contained" onClick={handleClassify}>Classify Image</Button>
        </Box>
      )}

      <Typography variant={'h2'} color={'#333'}>Inventory Items</Typography>

      <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
        {inventory.map(({ name, category, quantity }) => (
          <Box
            key={name}
            width="100%"
            minHeight="150px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            paddingX={5}
          >
            <Typography variant={'h3'} color={'#333'}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h6'} color={'#333'}>
              Category: {category}
            </Typography>
            <Typography variant={'h6'} color={'#333'}>
              Quantity: {quantity}
            </Typography>
            <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
          </Box>
        ))}
      </Stack>
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
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
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemCategory);
                setItemName('');
                setItemCategory('');
                setOpen(false);
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;
