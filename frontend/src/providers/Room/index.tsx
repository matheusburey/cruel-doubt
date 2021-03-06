import { useToast } from "@chakra-ui/react";
import { off, onValue, ref } from "firebase/database";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../service/api";
import { database } from "../../services/firebase";

interface IFirebaseQuestions {
  [key: string]: IQuestions & {
    likes: {
      [key: string]: {
        authorId: string;
      };
    };
  };
}

interface IAuthContext {
  title: string;
  questions: IQuestions[] | undefined;
  getRoom: (roomId: string, userId?: string) => void;
  checkRoom: (roomId: string) => void;
  newRoom: (title: string) => void;
}

interface IQuestions {
  id?: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  isHighlighted: string;
  isAnswered: string;
  likeCount?: number;
  likeId?: string | undefined;
}

interface IChildrenProps {
  children: ReactNode;
}

const RoomContext = createContext({} as IAuthContext);

export const RoomUse = () => useContext(RoomContext);

export function RoomProvider({ children }: IChildrenProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<IQuestions[]>();
  const [title, setTitle] = useState("");

  const serialize = (
    questionsData: IFirebaseQuestions,
    userId = ""
  ): IQuestions[] => {
    return Object.entries(questionsData as IFirebaseQuestions).map(
      ([key, values]) => {
        return {
          id: key,
          content: values.content,
          author: values.author,
          isHighlighted: values.isHighlighted,
          isAnswered: values.isAnswered,
          likeCount: Object.values(values.likes ?? {}).length,
          likeId: Object.entries(values.likes ?? {}).find(
            ([, like]) => like.authorId === userId
          )?.[0],
        };
      }
    );
  };

  const getRoom = (roomId: string, userId = "") => {
    onValue(ref(database, `rooms/${roomId}`), (room) => {
      const { questions, title } = room.val();
      let questionsArray: IQuestions[] = [];

      if (questions) {
        questionsArray = serialize(questions as IFirebaseQuestions, userId);
      }
      setTitle(title);
      setQuestions(questionsArray);
      return () => off(ref(database));
    });
  };

  const checkRoom = async (roomId: string) => {
    const { data } = await api.get(`rooms${roomId}`);
    if (!data) {
      toast({
        title: "sala nao existe.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      throw new Error();
    }
    setTitle(data.detail.data.title);
  };

  const newRoom = async (title: string) => {
    const { data } = await api.post("rooms", { title });
    if (!data) {
      toast({
        title: "sala nao existe.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      throw new Error();
    }
    const roomId = data.detail.data._id;
    navigate(`rooms/${roomId}`);
  };

  const value = useMemo(
    () => ({ title, questions, getRoom, checkRoom, newRoom }),
    [title, questions]
  );

  return (
    <RoomContext.Provider value={value}> {children} </RoomContext.Provider>
  );
}
