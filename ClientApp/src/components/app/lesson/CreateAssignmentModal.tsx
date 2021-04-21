import * as React from "react";
import { useMemo, useRef, useState } from "react";

import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper,
    Textarea, useToast, VStack
} from "@chakra-ui/react";

import Classroom from "../../../models/Classroom";
import Lesson from "../../../models/Lesson";

import lessonsApi from "../../../api/http/lessons";

interface CreateAssignmentModalProps {
    isOpen: boolean;
    classroom: Classroom;
    lesson: Lesson;

    onCreate: () => void;
    onClose: () => void;
}

const CreateAssignmentModal = (props: CreateAssignmentModalProps): React.ReactElement => {
    const { isOpen, classroom, lesson, onCreate, onClose } = props;

    const initialRef = useRef(null);
    const toast = useToast();

    const [isCreatingAssignment, setIsCreatingClassroom] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [points, setPoints] = useState(0);

    const isDisabled = useMemo(() => {
        return !name || isNaN(Date.parse(dueDate));
    }, [name, dueDate]);

    const createAssignment = async () => {
        setIsCreatingClassroom(true);
        try {
            await lessonsApi.createAssignment(classroom.Id, lesson.Id, {
                Id: "",
                Name: name,
                Description: description,
                DueDate: Date.parse(dueDate),
                Points: points || 0
            });

            setName("");
            setDescription("");
            setDueDate("");
            setPoints(0);
            onCreate();
            onClose();
        } catch (error) {
            toast({
                title: "The assignment could not be created.",
                description: "You most likely don't have the permissions to create assignments. Contact a teacher to create a assignment.",
                status: "error",
                isClosable: true,
            });
            console.error(error);
        } finally {
            setIsCreatingClassroom(false);
        }
    };

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.currentTarget.value);
    const onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.currentTarget.value);
    const onDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => setDueDate(event.currentTarget.value);
    const onPointsChange = (_: string, value: number) => {
        setPoints(value);
    };

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Create new assignment</ModalHeader>
                <ModalCloseButton/>
                <ModalBody pb={6}>
                    <VStack spacing={3}>
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input
                                ref={initialRef}
                                placeholder="Assignment Zero"
                                value={name}
                                onChange={onNameChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="Oh no... homework :("
                                value={description}
                                onChange={onDescriptionChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Due date</FormLabel>
                            <Input
                                placeholder={new Date().toUTCString()}
                                value={dueDate}
                                onChange={onDueDateChange}
                            />
                            <FormHelperText>Not ideal, I know</FormHelperText>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Points</FormLabel>
                            <NumberInput value={points} min={0} max={100} onChange={onPointsChange}>
                                <NumberInputField/>
                                <NumberInputStepper>
                                    <NumberIncrementStepper/>
                                    <NumberDecrementStepper/>
                                </NumberInputStepper>
                            </NumberInput>
                            <FormHelperText>Be nice to your students, give more points (max 100)</FormHelperText>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        isLoading={isCreatingAssignment}
                        isDisabled={isDisabled}
                        colorScheme="blue"
                        mr={3}
                        onClick={createAssignment}
                    >
                        Create
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateAssignmentModal;