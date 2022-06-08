import { createAsyncThunk } from '@reduxjs/toolkit';
import ax from '../../utils/axios';

export const upvoteAdded = createAsyncThunk('upvotes/upvoteAdded', async id => {
  await ax.post('/upvotes', { productRequestId: id });

  return id;
});

export const upvoteRemoved = createAsyncThunk(
  'upvotes/upvoteRemoved',
  async id => {
    await ax.delete('/upvotes', {
      data: { productRequestId: id },
    });

    return id;
  }
);
