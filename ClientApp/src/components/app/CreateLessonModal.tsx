import * as React from "react";
import {
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Button,
    RadioGroup,
    Stack,
    Radio,
    VStack,
    FormHelperText,
    Textarea,
    HStack,
    useToast
} from "@chakra-ui/react";

import lessonsApi from "../../api/http/Lesson";
import { useMemo, useRef, useState } from "react";
import LessonType from "../../models/LessonType";

export interface CreateLessonModalProps {
    isOpen: boolean,

    classroomId: string,

    onClose: () => void,
    onCreate: () => void,
}

const CreateLessonModal = (props: CreateLessonModalProps): React.ReactElement => {
    const { isOpen, onClose, onCreate, classroomId } = props;

    const [lessonName, setLessonName] = useState("");
    const [lessonDescription, setLessonDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [meetingUri, setMeetingUri] = useState("");
    const [lessonType, setLessonType] = useState<string>(LessonType.InPerson);
    
    const [creatingLesson, setCreatingLesson] = useState(false);

    const initialRef = useRef(null);
    const toast = useToast();
    
    const createButtonDisabled = useMemo(() => {
        return !(lessonName && !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate)));
    }, [lessonName, startDate, endDate]);

    const onLessonCreate = async () => {
        setCreatingLesson(true);
        
        try {
            await lessonsApi.create(classroomId, {
                Id: "",
                Name: lessonName,
                Description: lessonDescription,
                StartDate: Date.parse(startDate),
                EndDate: Date.parse(endDate),
                LessonType: LessonType[lessonType as keyof typeof LessonType],
                MeetingUri: meetingUri,
                Teachers: [],
            });

            setLessonName("");
            setLessonDescription("");
            setStartDate("");
            setEndDate("");
            setMeetingUri("");
            setLessonType(LessonType.InPerson);
            onCreate();
            onClose();
        } catch (error) {
            toast({
                title: "The lesson could not be created.",
                description: "You most likely don't have the permissions to create lessons. Contact the Classroom owner to create a lesson.",
                status: "error",
                isClosable: true,
            });
            console.error(error);
        } finally {
            setCreatingLesson(false);
        }
    };

    const onLessonNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLessonName(event.currentTarget.value);
    };

    const onLessonDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLessonDescription(event.currentTarget.value);
    };

    const onLessonMeetingUriChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMeetingUri(event.currentTarget.value);
    };

    const onStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.currentTarget.value);
    };
    const onEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.currentTarget.value);
    };

    return (
        <Modal
            size={"2xl"}
            initialFocusRef={initialRef}
            isOpen={isOpen}
            onClose={onClose}
            isCentered
        >
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Create lesson</ModalHeader>
                <ModalCloseButton/>
                <ModalBody pb={6}>
                    <VStack spacing={3}>
                        <FormControl>
                            <RadioGroup onChange={setLessonType} value={lessonType}>
                                <Stack direction="row">
                                    <Radio value={LessonType.Online}>Online</Radio>
                                    <Radio value={LessonType.InPerson}>In Person</Radio>
                                    <Radio value={LessonType.Hybrid}>Hybrid</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input
                                ref={initialRef}
                                placeholder="Lesson Zero"
                                value={lessonName}
                                onChange={onLessonNameChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="First lesson that will cover Swift Basics"
                                value={lessonDescription}
                                onChange={onLessonDescriptionChange}
                            />
                        </FormControl>
                        <HStack w={"full"} spacing={3}>
                            <FormControl>
                                <FormLabel>Start date</FormLabel>
                                <Input
                                    placeholder={new Date().toUTCString()}
                                    value={startDate}
                                    onChange={onStartDateChange}
                                />
                                <FormHelperText>Not ideal, I know</FormHelperText>
                            </FormControl>
                            <FormControl>
                                <FormLabel>End date</FormLabel>
                                <Input
                                    placeholder={new Date().toUTCString()}
                                    value={endDate}
                                    onChange={onEndDateChange}
                                />
                                <FormHelperText>Make sure it&apos;s correct!</FormHelperText>
                            </FormControl>
                        </HStack>
                        <FormControl>
                            <FormLabel>Meeting URL</FormLabel>
                            <Input
                                placeholder="https://meet.google.com"
                                value={meetingUri}
                                onChange={onLessonMeetingUriChange}
                            />
                            <FormHelperText>A link will be made automatically if this field is left
                                empty.</FormHelperText>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        isLoading={creatingLesson}
                        isDisabled={createButtonDisabled}
                        colorScheme="blue"
                        mr={3}
                        onClick={onLessonCreate}
                    >
                        Create
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateLessonModal;