import { createAsyncThunk } from '@reduxjs/toolkit';
import { client } from '../../client';

const UPVOTES = 'upvotes';

export const upvoteAdded = createAsyncThunk(
  `${UPVOTES}/upvoteAdded`,
  async (id: number) => {
    await client('upvotes', {
      method: 'POST',
      body: { productRequestId: id },
    });

    return id;
  }
);

export const upvoteRemoved = createAsyncThunk(
  `${UPVOTES}/upvoteRemoved`,
  async (id: number) => {
    await client('upvotes', {
      method: 'DELETE',
      body: { productRequestId: id },
    });

    return id;
  }
);
