import * as React from "react";
import { NavLink } from "react-router-dom";

import {
    Box,
    Button,
    Flex,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbItem
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

import { OidcPaths } from "../../oidc/AuthorizationConstants";

interface ClassroomNavBarProps {
    classroomName: string;
}

const ClassroomNavBar = (props: ClassroomNavBarProps): React.ReactElement => {
    return (
        <Flex p={"3"} align="center">
            <Box>
                <Heading size={"md"}>
                    <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500"/>}>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/app">Classrooms</BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href="#">{props.classroomName}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </Heading>
            </Box>
            <Spacer/>
            <Box>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} mr={4}>
                        My Account
                    </MenuButton>
                    <MenuList>
                        <a href={`$/${OidcPaths.IdentityManagePath}`}>
                            <MenuItem>Manage</MenuItem>
                        </a>
                        <NavLink to={{ pathname: OidcPaths.LogOut, state: { local: true } }}>
                            <MenuItem>Logout</MenuItem>
                        </NavLink>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};

export default ClassroomNavBar;