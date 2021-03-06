import {
  Avatar,
  Badge,
  Box,
  Flex,
  Stack,
  Text,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { push, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import Question from "../components/Question";
import { AuthUse } from "../providers/Auth";
import { RoomUse } from "../providers/Room";
import { database } from "../services/firebase";

function Room() {
  const { id } = useParams();
  const { user, signInWithGoogle } = AuthUse();
  const { questions, title, getRoom } = RoomUse();
  const [newQuestion, setNewQuestion] = useState("");

  if (!id) {
    throw new Error("id");
  }

  useEffect(() => {
    getRoom(id);
  }, [id]);

  const handleLike = async (questionId = "", likeId = "") => {
    if (!likeId) {
      await set(
        push(ref(database, `rooms/${id}/questions/${questionId}/likes`)),
        {
          authorId: user?.id,
        }
      );
    } else {
      remove(
        ref(database, `rooms/${id}/questions/${questionId}/likes/${likeId}`)
      );
    }
  };

  const handleSubmitNewQuestion = async () => {
    if (!newQuestion.trim()) {
      return;
    }
    if (!user) {
      throw new Error("You must be logged in ");
    }

    const question = {
      content: newQuestion,
      author: user,
      isHighlighted: false,
      isAnswered: false,
    };

    await set(push(ref(database, `rooms/${id}/questions`)), question);
    setNewQuestion("");
  };

  return (
    <>
      <Header id={id} />
      <Box as="main" maxW="800px" mx="auto" p="4">
        <Flex mt="8" mb="6">
          <Text as="h1" fontWeight="bold" fontSize="2xl" fontFamily="poppins">
            Sala {title}
          </Text>
          <Badge ml="4" py="2" px="3" colorScheme="purple" borderRadius="full">
            {questions?.length} perguntas
          </Badge>
        </Flex>

        <Textarea
          variant="filled"
          boxShadow="md"
          bg="white"
          minH="130px"
          placeholder="Qual sua pergunta?"
          value={newQuestion}
          onChange={(event) => setNewQuestion(event.target.value)}
        />

        <Flex my="8" align="center" justify="space-between">
          {user ? (
            <Flex align="center">
              <Avatar name={user.name} src={user.avatar} size="sm" mr="2" />
              <span>{user.name}</span>
            </Flex>
          ) : (
            <Text fontSize="sm" align="center" pt="2" color="gray">
              Para enviar uma pergunta
              <Button
                w="auto"
                ml="1"
                fontSize="sm"
                color="pink.400"
                variant="link"
                onClick={signInWithGoogle}
              >
                fa??a seu login
              </Button>
            </Text>
          )}
          <Button
            onClick={handleSubmitNewQuestion}
            disabled={!newQuestion || !user}
            w="auto"
          >
            Enviar pergunta
          </Button>
        </Flex>
        <Stack>
          {questions?.map(
            ({
              id,
              author,
              isHighlighted,
              isAnswered,
              content,
              likeCount,
              likeId,
            }) => {
              return (
                <Question
                  key={id}
                  isAnswered={isAnswered}
                  isHighlighted={isHighlighted}
                  author={author}
                  content={content}
                >
                  <Button
                    variant="ghost"
                    aria-label="Marcar como gostei"
                    onClick={() => handleLike(id, likeId)}
                    rightIcon={<AiOutlineLike />}
                    fontSize="24px"
                    _hover={{ color: "#B794F4" }}
                    disabled={!user}
                  >
                    {!!likeCount && (
                      <Text fontSize="lg" pt="2">
                        {likeCount}
                      </Text>
                    )}
                  </Button>
                </Question>
              );
            }
          )}
        </Stack>
      </Box>
    </>
  );
}

export default Room;
