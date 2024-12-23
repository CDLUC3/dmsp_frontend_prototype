'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Button,
} from "react-aria-components";

import {
  LayoutWithPanel,
  ContentContainer,
} from '@/components/Container';


const ToastifyPage: React.FC = () => {

  const router = useRouter();

  const handleButtonPress = () => {
    toast("Successfully updated!", {
      position: "top-center",
      autoClose: 40000,
      className: 'success',
    });
    router.push('/template')
  }

  return (
    <>
      <div>
        <div >
          <LayoutWithPanel>
            <ContentContainer>
              <h2>Toastify Test</h2>
              <div>

                <Button onPress={handleButtonPress}>Test Toastify</Button>

              </div>

            </ContentContainer>

          </LayoutWithPanel>
        </div>
      </div >
    </>
  )
}

export default ToastifyPage;