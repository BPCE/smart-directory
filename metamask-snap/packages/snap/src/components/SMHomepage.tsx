import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import React, { useEffect, useState } from 'react';
import { Bold, Button, Box, Text, Row, Heading, Form, Field, Dropdown, Option, Section, Input, Address, Icon, Image, Link, Tooltip } from '@metamask/snaps-sdk/jsx';
import { Chain } from 'viem';
import { buildCaip10Address, getSmDirUri, getTitle, 
    createCustomClient, SmartDirectoryConfigEntry,
    SmartDirectoryConfigExpandedEntry,
    getChainIds, getChainNameFromId } from '../chain_utils';



type HomepageProps = {
  smartDirectoryConfig_param: SmartDirectoryConfigExpandedEntry[];
};

export const Homepage: SnapComponent<HomepageProps> = ({smartDirectoryConfig_param} ) => {
  if (!Array.isArray(smartDirectoryConfig_param)) {
    console.error('smartDirectoryConfig is not an array:', smartDirectoryConfig_param);
    // return null; // Or handle the error appropriately
  }
  if (smartDirectoryConfig_param.length === 0) {
    console.error('smartDirectoryConfig is empty or invalid:', JSON.stringify(smartDirectoryConfig_param));
  }

  console.log('Homepage component', JSON.stringify(smartDirectoryConfig_param));

  return (
    <Box>
      {(smartDirectoryConfig_param.length == 0 )?
        <Heading>No Smart Directory Configurations Found Please add a configuration to get started.</Heading>:<Heading> </Heading>
      }
      <Section>
        <Heading>Add a new Smart Directory:</Heading>
        <Form name="form-add-smart-directory">
          <Field label="Smart Directory Address">
            <Input name="smartDirectoryAddress" placeholder="Enter another smart directory address" />
          </Field>
          <Text>In chain:</Text>
          <Dropdown name="chainId">
            {getChainIds().map((id) => (
              <Option key={`chain-${id}`} value={id.toString()}>
                {getChainNameFromId(id) || `Chain ${id}`}
              </Option>
            ))}
          </Dropdown>
          <Button type="submit">Add</Button>
        </Form>
      </Section>
      {smartDirectoryConfig_param.length > 0 ?
      <Heading>List of the Configured Smart Directories</Heading>:
      <Heading>No Configured Smart Directories</Heading>}
      {smartDirectoryConfig_param.map((entry, index) => (
        <Section key={`config-${index}`}>
          <Box alignment="center">
            <Box>
              <Text>{entry.smDirTitle || 'No smart directory title'}</Text>
              {isValidUri(entry.smDirUri)?
                <Link href={entry.smDirUri || '#'}>{entry.smDirUri || 'No smart directory URI'}</Link>
                :
                <Text>{entry.smDirUri || 'No smart directory URI'}</Text>
              }
              <Address address={buildCaip10Address('eip155', entry.chainId.toString(), entry.smDirAddress)} />
              <Text>{entry.rpcUrl}</Text>
            </Box>
            <Box alignment="center" direction="horizontal" crossAlignment='center'>
              <Form name={`delete-form-${index}`}>
                <Section key={`delete-form`}>
                  <Button type="submit">
                    <Image src={trashCanSvgContent} alt="Delete" />
                  </Button>
                </Section>
              </Form>
              <Text>Delete</Text>
            </Box>
          </Box>
        </Section>
      ))}
    </Box>
  );
};

function isValidUri(uri: any): boolean {
  if (!uri || typeof uri !== 'string') {
    return false;
  }
  if (uri.length === 0) {
    return false;
  }
  if (uri.startsWith('http')) {
    return true;
  }
  return false;
}

const trashCanSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="30" height="30" viewBox="0 0 256 256" xml:space="preserve">
<g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
    <path d="M 64.71 90 H 25.291 c -4.693 0 -8.584 -3.67 -8.859 -8.355 l -3.928 -67.088 c -0.048 -0.825 0.246 -1.633 0.812 -2.234 c 0.567 -0.601 1.356 -0.941 2.183 -0.941 h 59.002 c 0.826 0 1.615 0.341 2.183 0.941 c 0.566 0.601 0.86 1.409 0.813 2.234 l -3.928 67.089 C 73.294 86.33 69.403 90 64.71 90 z M 18.679 17.381 l 3.743 63.913 C 22.51 82.812 23.771 84 25.291 84 H 64.71 c 1.52 0 2.779 -1.188 2.868 -2.705 l 3.742 -63.914 H 18.679 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
    <path d="M 80.696 17.381 H 9.304 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 71.393 c 1.657 0 3 1.343 3 3 S 82.354 17.381 80.696 17.381 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
    <path d="M 58.729 17.381 H 31.271 c -1.657 0 -3 -1.343 -3 -3 V 8.789 C 28.271 3.943 32.214 0 37.061 0 h 15.879 c 4.847 0 8.789 3.943 8.789 8.789 v 5.592 C 61.729 16.038 60.386 17.381 58.729 17.381 z M 34.271 11.381 h 21.457 V 8.789 C 55.729 7.251 54.478 6 52.939 6 H 37.061 c -1.538 0 -2.789 1.251 -2.789 2.789 V 11.381 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
    <path d="M 58.33 74.991 c -0.06 0 -0.118 -0.002 -0.179 -0.005 c -1.653 -0.097 -2.916 -1.517 -2.819 -3.171 l 2.474 -42.244 c 0.097 -1.655 1.508 -2.933 3.171 -2.819 c 1.653 0.097 2.916 1.516 2.819 3.17 l -2.474 42.245 C 61.229 73.761 59.906 74.991 58.33 74.991 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
    <path d="M 31.669 74.991 c -1.577 0 -2.898 -1.23 -2.992 -2.824 l -2.473 -42.245 c -0.097 -1.654 1.165 -3.073 2.819 -3.17 c 1.646 -0.111 3.073 1.165 3.17 2.819 l 2.473 42.244 c 0.097 1.654 -1.165 3.074 -2.819 3.171 C 31.788 74.989 31.729 74.991 31.669 74.991 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
    <path d="M 45 74.991 c -1.657 0 -3 -1.343 -3 -3 V 29.747 c 0 -1.657 1.343 -3 3 -3 c 1.657 0 3 1.343 3 3 v 42.244 C 48 73.648 46.657 74.991 45 74.991 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
</g>
</svg>`;
