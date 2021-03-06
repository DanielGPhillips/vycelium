// React Import
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
// Mui Component Import
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
// import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
// Mui Icon Import
import PhotoCamera from '@mui/icons-material/PhotoCamera';
// Firebase Import
import { storage } from '../firebase';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
// Resource Import
import moment from 'moment';
import { CREATE_POST } from '../utils/mutations';
import Auth from '../utils/auth';


const Input = styled('input')({
    // visibility: 'hidden',
    });

export default function PostCreate() {
    const [postInput, setPostInput] = useState({body: '', imageFlag: false, image:''});
    const [imageSelection, setImageSelection] = useState(null);

    const [createPost, { error, data }] = useMutation(CREATE_POST);

    function getUser() {
        if (Auth.loggedIn() === true) {
          const user = Auth.getProfile().data
          return user;
        } else {
            return 'No User'
        }
    }
    const user = getUser();
    const id = user.id;
    

    const handleChange = (event) => {
        const { name,value } = event.target;

        setPostInput({
            ...postInput,
            [name]: value,
        });
    }
    const imageSelectedHandler = event => {
        if (event.target.files[0]) {
            setImageSelection(event.target.files[0]);
        }    
    }

    const imageUploadHandler = () => {
        if (imageSelection !== null ) {
            const now = moment().format()  
            const storageRef = ref(storage, 'postImages/' + id + now)
            const uploadTask = uploadBytesResumable(storageRef, imageSelection);

            uploadTask.on('state changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;
                    case 'storage/canceled':
                    // User canceled the upload
                    break;          
                    case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                }

            },
            () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                        setPostInput({
                            imageFlag: true,
                            image: downloadUrl,
                        })
                    })
                }
            )
        }
    }

    const handlePostSubmit = async (event) => {
        event.preventDefault();
        try {
            imageUploadHandler()
            await createPost({
                variables: {
                    createPostInput: { ...postInput },
                }
            })
            // Auth.loggedIn()
        } catch (e) {
            console.error(e);
        }

        setPostInput({
            body: '',
            selectedImage: null,
            imageFlag: false,
            image: ''
        })

        setImageSelection(null)
    };

  return (
    <Paper elevation={2} sx={{ marginTop:'5px'}}>
        <Box component="form" noValidate onSubmit={handlePostSubmit}>
            <Grid container direction="column">
                <Grid container direction="row">
                    <Grid item xs={3} sm={2}>
                        <Avatar
                            src={user.profilePicture} 
                            sx={{ marginTop:'5px', marginLeft:'10px', marginRigh:'10px'}} 
                        />
                    </Grid>
                    <Grid item xs={9} sm={10}>
                        <TextField
                        id="body"
                        name="body"
                        value={postInput.body}
                        onChange={handleChange}
                        variant="standard"
                        label="Create a Post"
                        placeholder="Spread the word..."
                        multiline
                        mt={6}
                        sx={{ width:'95%'}}
                        />
                    </Grid>
                </Grid>

                <Grid container direction="row">                
                    <Grid item xs={2} alignContent="center" />     
                    <Grid item xs={10} alignContent="center">
                        <label htmlFor="icon-button-file">
                            <IconButton color="primary" aria-label="upload picture" component="span">
                                <Input 
                                accept="image/png" 
                                id="icon-button-file" 
                                type="file"
                                onChange={imageSelectedHandler} 
                                />
                                <PhotoCamera />
                            </IconButton>
                        </label>           
                        <Button
                        type="submit" 
                        variant="contained" 
                        size="small" 
                        sx={{ float:"right", marginTop:"5px", marginRight:"15px"}}
                        >
                            Post
                        </Button>
                    </Grid>                
                </Grid>
            </Grid>        
        </Box>
    </Paper>
  )
}

