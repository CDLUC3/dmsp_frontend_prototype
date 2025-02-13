"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import { X } from "lucide-react";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Radio,
  RadioGroup,
  Text,
  TextField
} from "react-aria-components";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import RadioGroupComponent from '@/components/Form/RadioGroup';


function SlideInPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // localization keys
  const Global = useTranslations('Global');
  const CreateProject = useTranslations('ProjectsCreateProject');


  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);

  const radioData = {
    radioGroupLabel: CreateProject('form.newOrExisting'),
    radioButtonData: [
      {
        value: 'previous',
        label: CreateProject('form.radioExistingLabel'),
        description: CreateProject('form.radioExistingHelpText'),
      },
      {
        value: 'new',
        label: CreateProject('form.radioNewLabel'),
        description: CreateProject('form.radioNewHelpText')
      }
    ]
  }


  // Close panel on pressing Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-focus on panel when it opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Button to open panel */}
      <Button onPress={openPanel} aria-haspopup="dialog">
        Preview
      </Button>

      {/* Slide-in panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex justify-end md:justify-center bg-black/50"
            initial={{ x: "100%" }}
            style={{ backgroundColor: 'lightblue' }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              onClick={closePanel}
              aria-label="Close panel"
              className="self-end p-2 rounded hover:bg-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            {/* Panel Content */}
            <LayoutWithPanel>
              <ContentContainer>
                <Form>
                  <TextField
                    name="template_name"
                    type="text"
                    isRequired
                  >
                    <Label>{CreateProject('form.projectTitle')}</Label>
                    <Text slot="description" className="help">
                      {CreateProject('form.projectTitleHelpText')}
                    </Text>
                    <Input />
                    <FieldError />
                  </TextField>

                  <RadioGroupComponent
                    radioGroupLabel={radioData.radioGroupLabel}
                    radioButtonData={radioData.radioButtonData}
                  />
                  <CheckboxGroup className="checkbox-group">
                    <Label>{CreateProject('form.checkboxGroupLabel')}</Label>
                    <Text slot="description" className="help">
                      {CreateProject('form.checkboxGroupHelpText')}
                    </Text>
                    <Checkbox value="is_mock_project">
                      <div className="checkbox">
                        <svg viewBox="0 0 18 18" aria-hidden="true">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                      <div className="">
                        <span>
                          {CreateProject('form.checkboxLabel')}
                        </span>
                        <br />
                        <span className="help">
                          {CreateProject('form.checkboxHelpText')}
                        </span>
                      </div>
                    </Checkbox>
                  </CheckboxGroup>

                </Form>

              </ContentContainer>
            </LayoutWithPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SlideInPanel;