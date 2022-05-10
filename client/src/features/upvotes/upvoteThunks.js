import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const upvoteAdded = createAsyncThunk('upvotes/upvoteAdded', async id => {
  await axios.post('/api/v1/upvotes', {
    productRequestId: id,
  });

  return id;
});

export const upvoteRemoved = createAsyncThunk(
  'upvotes/upvoteRemoved',
  async id => {
    await axios.delete('/api/v1/upvotes', {
      data: { productRequestId: id },
    });

    return id;
  }
);
