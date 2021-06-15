/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {createContext, useState, useCallback} from 'react';
import firebase from 'firebase/app';

import {Config} from 'react-native-config';
import {useCollectionData} from 'react-firebase-hooks/firestore';
const {SINGLE_LIST_ID} = Config;

export type Todo = {
  id: string;
  description: string;
  done: boolean;
};

const defaultState = {
  data: [],
};

const defaultActions = {
  addTodo: async (_newTodo: string) => {},
  toggleDone: async (todo: Todo) => {},
};

export const TodoContext = createContext({
  isLoading: false,
  ...defaultState,
  ...defaultActions,
});

const TodoProvider: React.FC = ({children}) => {
  const [data, isLoading, error] = useCollectionData(
    firebase
      .firestore()
      .collection('todoLists')
      .doc(SINGLE_LIST_ID)
      .collection('todos'),
    {idField: 'id'},
  );

  const addTodo = useCallback(async newTodo => {
    if (newTodo.length) {
      try {
        await firebase
          .firestore()
          .collection('todoLists')
          .doc(SINGLE_LIST_ID)
          .collection('todos')
          .add({
            description: newTodo,
            done: false,
          });
      } catch ({message}) {
        console.error(message);
      }
    }
  }, []);

  const toggleDone = useCallback(async ({id, done}: Todo) => {
    try {
      await firebase
        .firestore()
        .collection('todoLists')
        .doc(SINGLE_LIST_ID)
        .collection('todos')
        .doc(id)
        .update({done: !done});
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <TodoContext.Provider
      value={{data, isLoading, error: error?.message, addTodo, toggleDone}}
      children={children}
    />
  );
};

export const MockedProvider: React.FC = props => (
  <TodoContext.Provider {...props} />
);

export default TodoProvider;
