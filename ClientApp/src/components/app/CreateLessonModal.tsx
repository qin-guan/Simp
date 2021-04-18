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

import lessonsApi from "../../api/http/lessons";
import { useMemo, useRef, useState } from "react";
import LessonType from "../../models/LessonType";

export interface CreateLessonModalProps {
    classroomId: string;
    isOpen: boolean;

    onClose: () => void;
    onCreate: () => void;
}

const CreateLessonModal = (props: CreateLessonModalProps): React.ReactElement => {
    const { isOpen, onClose, onCreate, classroomId } = props;

    const [lessonName, setLessonName] = useState("");
    const [lessonDescription, setLessonDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [meetingUri, setMeetingUri] = useState("");
    const [lessonType, setLessonType] = useState<string>(LessonType.InPerson);
    
    const [isCreatingLesson, setIsCreatingLesson] = useState(false);

    const initialRef = useRef(null);
    const toast = useToast();
    
    const isCreateButtonDisabled = useMemo(() => {
        return !(lessonName && !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate)));
    }, [lessonName, startDate, endDate]);

    const createLesson = async () => {
        setIsCreatingLesson(true);
        
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
            setIsCreatingLesson(false);
        }
    };

    const onLessonNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLessonName(event.currentTarget.value);
    };

    const onLessonDescriptionChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLessonDescription(event.currentTarget.value);
    };

    const onLessonMeetingUriChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMeetingUri(event.currentTarget.value);
    };

    const onStartDateChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.currentTarget.value);
    };
    const onEndDateChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                                onChange={onLessonNameChanged}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="First lesson that will cover Swift Basics"
                                value={lessonDescription}
                                onChange={onLessonDescriptionChanged}
                            />
                        </FormControl>
                        <HStack w={"full"} spacing={3}>
                            <FormControl>
                                <FormLabel>Start date</FormLabel>
                                <Input
                                    placeholder={new Date().toUTCString()}
                                    value={startDate}
                                    onChange={onStartDateChanged}
                                />
                                <FormHelperText>Not ideal, I know</FormHelperText>
                            </FormControl>
                            <FormControl>
                                <FormLabel>End date</FormLabel>
                                <Input
                                    placeholder={new Date().toUTCString()}
                                    value={endDate}
                                    onChange={onEndDateChanged}
                                />
                                <FormHelperText>Make sure it&apos;s correct!</FormHelperText>
                            </FormControl>
                        </HStack>
                        <FormControl>
                            <FormLabel>Meeting URL</FormLabel>
                            <Input
                                placeholder="https://meet.google.com"
                                value={meetingUri}
                                onChange={onLessonMeetingUriChanged}
                            />
                            <FormHelperText>A link will be made automatically if this field is left
                                empty.</FormHelperText>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        isLoading={isCreatingLesson}
                        isDisabled={isCreateButtonDisabled}
                        colorScheme="blue"
                        mr={3}
                        onClick={createLesson}
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