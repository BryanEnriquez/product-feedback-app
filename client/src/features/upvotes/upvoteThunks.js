import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const upvoteAdded = createAsyncThunk('upvotes/upvoteAdded', async id => {
  await axios.post(`${process.env.REACT_APP_API}/upvotes`, {
    productRequestId: id,
  });

  return id;
});

export const upvoteRemoved = createAsyncThunk(
  'upvotes/upvoteRemoved',
  async id => {
    await axios.delete(`${process.env.REACT_APP_API}/upvotes`, {
      data: { productRequestId: id },
    });

    return id;
  }
);
