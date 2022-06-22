import { Badge, Box, Flex, HStack, Image, Text } from "@chakra-ui/react";
import { ref, remove, update } from "firebase/database";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import answerImg from "../assets/images/answer.svg";
import checkImg from "../assets/images/check.svg";
import deleteImg from "../assets/images/delete.svg";
import logoImg from "../assets/images/logo.svg";
import Button from "../components/Button";
import Question from "../components/Question";
import RoomCode from "../components/RoomCode";
import { RoomUse } from "../providers/Room";
import { database } from "../services/firebase";

function AdminRoom() {
  const { id } = useParams();
  const { title, questions, getRoom } = RoomUse();
  const navigate = useNavigate();

  if (!id) {
    throw new Error("id");
  }

  useEffect(() => {
    getRoom(id);
  }, [id]);

  const handleEndRoom = () => {
    if (window.confirm("voce realmente deseja encerar esta sala")) {
      remove(ref(database, `rooms/${id}`));
      navigate("/");
    }
  };

  const handleDeleteQuestion = (questionId = "") => {
    if (
      window.confirm("voce realmente deseja excluir essa pergunta") &&
      questionId
    ) {
      remove(ref(database, `rooms/${id}/questions/${questionId}`));
    }
  };

  const handleHighlightQuestion = (questionId = "") => {
    if (questionId) {
      update(ref(database, `rooms/${id}/questions/${questionId}`), {
        isHighlighted: true,
      });
    }
  };

  const handleCheckQuestionAnswer = (questionId = "") => {
    if (questionId) {
      update(ref(database, `rooms/${id}/questions/${questionId}`), {
        isAnswered: true,
      });
    }
  };

  return (
    <>
      <Box as="header" p="6" borderBottom="#e2e8f0 solid 1px">
        <Flex maxW="1120px" mx="auto" align="center" justify="space-between">
          <Image maxH="45px" src={logoImg} alt="Letmeask" />
          <HStack spacing="4">
            <RoomCode code={id} />
            <Button variant="outline" w="auto" h="40px" onClick={handleEndRoom}>
              Encerar sala
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" maxW="800px" mx="auto">
        <Flex mt="8" mb="6">
          <Text as="h1" fontWeight="bold" fontSize="2xl" fontFamily="poppins">
            Sala {title}
          </Text>
          <Badge ml="4" py="2" px="3" colorScheme="purple" borderRadius="full">
            {questions?.length} perguntas
          </Badge>
        </Flex>
        {questions?.map(
          ({ id, isHighlighted, isAnswered, author, content }) => {
            return (
              <Question
                key={id}
                author={author}
                isHighlighted={isHighlighted}
                isAnswered={isAnswered}
                content={content}
              >
                <button
                  type="button"
                  aria-label="Marcar pergunta pergunta como respondida"
                  onClick={() => handleCheckQuestionAnswer(id)}
                >
                  <img src={checkImg} alt="Remover pergunta" />
                </button>
                <button
                  type="button"
                  aria-label="Dar pergunta destaque a pergunta"
                  onClick={() => handleHighlightQuestion(id)}
                >
                  <img src={answerImg} alt="Remover pergunta" />
                </button>
                <button
                  type="button"
                  aria-label="Remover pergunta"
                  onClick={() => handleDeleteQuestion(id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
            );
          }
        )}
      </Box>
    </>
  );
}

export default AdminRoom;
