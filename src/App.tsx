import React, { useEffect, useState, useCallback } from 'react';
import { UseMutateFunction } from 'react-query';
import { Form, InputNumber, Button, Menu, Row, Col } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import styles from './AppFlatrateForm.module.scss';
import FlatratePriceInputs from './FlatratePriceInputs';
import { Packages, PricingBillingTypes, PricingData, FlatratePricingFormData } from 'utils/types';
import { displayWarning } from 'utils/helpers';
import PricingDemoSwitch from '../PricingDemoSwitch/PricingDemoSwitch';

type AppFlatrateFormProps = {
  packages: Packages;
  isSaving: boolean;
  onModalShow: () => void;
  updatePackage: UseMutateFunction<Partial<PricingData>, unknown, Partial<PricingData>, unknown>;
};

const AppFlatrateForm = ({ onModalShow, isSaving, packages, updatePackage }: AppFlatrateFormProps) => {
  const [selectedPackage, setSelectedPackage] = useState<PricingData | null>(null);
  const [addDemo, setAddDemo] = useState<boolean>(false);
  const [form] = Form.useForm();

  const flatratePackages = packages.data.filter((pkg) => pkg.billingSchema === PricingBillingTypes.FLAT_RATE);
  const setFormData = useCallback(() => {
    const { demoPeriod, unitAmount, features } = selectedPackage!;
    setAddDemo(!!selectedPackage!.demoPeriod);
    form.setFieldsValue({
      demoPeriod,
      unitAmount,
      features,
    });
  }, [selectedPackage, setAddDemo, form]);

  const handleResetForm = useCallback(() => {
    if (selectedPackage) setFormData();
    else form.resetFields();
  }, [form, selectedPackage, setFormData]);

  const handlePkgChange = (value: { key: string }) => {
    const packageData = flatratePackages.find((pkg) => pkg.id === value.key);
    if (!packageData) {
      setSelectedPackage(null);
      return form.resetFields();
    }
    setSelectedPackage(packageData);
  };

  const handleFinish = (values: FlatratePricingFormData) => {
    if (!selectedPackage?.id) return displayWarning('Please choose package for update');
    const { unitAmount, demoPeriod, features } = values;
    const packageData = {
      // default values provided when creating package, in a modal
      id: selectedPackage?.id,
      name: selectedPackage?.name,
      unitAmount,
      demoPeriod,
      features,
    };
    updatePackage(packageData);
  };

  useEffect(() => {
    if (packages.type === PricingBillingTypes.FLAT_RATE && packages.data.length) setSelectedPackage(packages.data[0]);
  }, [setSelectedPackage, packages]);

  useEffect(() => {
    handleResetForm();
  }, [selectedPackage, handleResetForm]);

  return (
    <Form name="basic" form={form} onFinish={handleFinish} autoComplete="off" layout="vertical" className={styles.form}>
      <PricingDemoSwitch form={form} addDemo={addDemo} setAddDemo={setAddDemo} />
      <Row className={styles.menuWrapper}>
        <Col
          style={{
            width: 110 * flatratePackages.length,
          }}
          className={styles.menuColumn}
        >
          <Menu
            className={styles.mainMenu}
            onClick={handlePkgChange}
            selectedKeys={selectedPackage?.id ? [selectedPackage.id] : []}
            mode="horizontal"
          >
            {flatratePackages.map((pkg) => (
              <Menu.Item key={pkg.id}>{pkg.name}</Menu.Item>
            ))}
          </Menu>
        </Col>
        <Button
          type="link"
          className={flatratePackages.length ? styles.manageBtn : styles.emptyManageBtn}
          onClick={onModalShow}
          icon={<SettingOutlined twoToneColor="#1890ff" />}
        >
          Manage
        </Button>
      </Row>
      <div className={styles.mainFormWrapper}>
        <Form.Item label="Package price" name="unitAmount" rules={[{ required: true, message: 'Enter base price' }]}>
          <InputNumber className={styles.basicInput} addonAfter="USD" defaultValue="0" min="0" />
        </Form.Item>
        <span className={styles.inputPostfix}>per month</span>
        <FlatratePriceInputs />
      </div>
      <div className={styles.buttonWrapper}>
        <Form.Item>
          <Button type="text" className={styles.discardBtn} onClick={handleResetForm} disabled={isSaving}>
            Discard changes
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            Save
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default AppFlatrateForm;
