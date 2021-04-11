import * as React from "react";

import {
    Box,
    Breadcrumb,
    BreadcrumbItem, BreadcrumbLink,
    Button,
    Flex,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

import { OidcPaths } from "../../oidc/AuthorizationConstants";
import { Link } from "react-router-dom";

interface AppNavBarProps {
    breadcrumbs?: { name: string, path: string }[]
}

const AppNavBar = (props: AppNavBarProps): React.ReactElement => {
    const { breadcrumbs = [] } = props;
    return (
        <Flex p={"3"} align="center">
            <Box>
                <Heading size={"md"}>
                    <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500"/>}>
                        <BreadcrumbItem>
                            <Link to={"/app"}>
                                <BreadcrumbLink>Classrooms</BreadcrumbLink>
                            </Link>
                        </BreadcrumbItem>

                        {breadcrumbs.map((breadcrumb, idx) => (
                            <BreadcrumbItem isCurrentPage key={idx.toString()}>
                                <Link to={breadcrumb.path}>
                                    <BreadcrumbLink>{breadcrumb.name}</BreadcrumbLink>
                                </Link>
                            </BreadcrumbItem>
                        ))}
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
                        <Link to={`$/${OidcPaths.IdentityManagePath}`}>
                            <MenuItem>Manage</MenuItem>
                        </Link>
                        <Link to={{ pathname: OidcPaths.LogOut, state: { local: true } }}>
                            <MenuItem>Logout</MenuItem>
                        </Link>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};

export default AppNavBar;