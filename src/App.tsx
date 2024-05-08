import React, { useEffect } from 'react';
import { Form, Input, Row, Col, Typography, Checkbox, FormInstance } from 'antd';
import { useMutation } from 'react-query';
import { createCompany, patchCompany } from '@/api/company';
import { createVendor, createVendorId, updateVendorData } from '@/api/onboarding';
import { CompanyCreate, CompanyPatch, VendorData, VendorDocumentData, Country } from 'utils/types';
import { displayError, displaySuccess, rules } from 'utils/helpers';
import AddressFields from './AddressFields';
import style from './CompanyInfoForm.module.scss';
import OnboardingFileUpload from './OnboardingFileUpload';
import useCompanyInfoFormHook from '../../../hooks/company/useCompanyInfoFormHook';
import { useGetCompany, useGetVendorData, useMappingObjKey, useDocumentUpload } from '@/hooks';
import { ONBOARDING_FORM_MESSAGES } from 'utils/constants';

const { Title } = Typography;
const { company, general } = ONBOARDING_FORM_MESSAGES;
const PAYLOAD_ERR_MSG =
  'There is a problem processing your request.  Please reach out to your primary contact at PCCW Global.';

type CompanyInfoFormProps = {
  form: FormInstance<any>;
  setRequestSuccess: (isSuccess: boolean) => void;
  setRequestIsLoading: (isLoading: boolean) => void;
};

const CompanyInfoForm = ({ form, setRequestSuccess, setRequestIsLoading }: CompanyInfoFormProps) => {
  const {
    sameRegistrationAddress,
    setSameRegistrationAddress,
    usaSelected,
    setUsaSelected,
    countries,
    setCountries,
    vendorType,
    vendorId,
    setOnBoardingState,
  } = useCompanyInfoFormHook();

  const { mapObjKey } = useMappingObjKey();

  // @TODO change this to custom HOOKS
  const { data: getCompanyResponse } = useGetCompany({ enabled: !!vendorId });
  const { data: getVendorDataResponse } = useGetVendorData(vendorId, {
    enabled: !!vendorId,
  });

  const { mutateAsync: createVendorMutation } = useMutation((payload: Partial<VendorData>) => createVendor(payload));
  const { mutateAsync: createCompanyMutation } = useMutation((payload: CompanyCreate) => createCompany(payload));
  const { mutateAsync: patchCompanyMutation } = useMutation((payload: CompanyPatch) => patchCompany(payload));
  const { mutateAsync: updateVendorDataMutation } = useMutation((payload: Partial<VendorData>) =>
    updateVendorData(vendorId as string, payload),
  );
  const { mutateAsync: addVendorDoc } = useDocumentUpload(vendorId);

  useEffect(() => {
    form.setFieldsValue(getCompanyResponse);
  }, [getCompanyResponse]);

  useEffect(() => {
    if (getVendorDataResponse && countries.length > 0) {
      const { registrationAddress, businessAddress, vat } = getVendorDataResponse;
      const vendorToCompanyMapping = {
        city: 'city',
        country: 'country',
        state: 'state',
        primaryAddress: 'street',
        secondaryAddress: 'street2',
        zipCode: 'zip',
      };

      const registrationAddressValues = mapObjKey(registrationAddress, vendorToCompanyMapping);
      const businessAddressValues = mapObjKey(businessAddress, vendorToCompanyMapping);
      form.setFieldsValue({
        address: {
          ...businessAddressValues,
          country: businessAddress.country
            ? countries.find((country: Country) => country.name === businessAddress.country.name)?.name
            : null,
        },
        registrationAddress: {
          ...registrationAddressValues,
          country: registrationAddress.country
            ? countries.find((country: Country) => country.name === registrationAddress.country.name)?.name
            : null,
        },
        vatNumber: vat,
      });

      handleCountrySelect();

      if (JSON.stringify(businessAddressValues) === JSON.stringify(registrationAddressValues)) {
        setSameRegistrationAddress(true);
      }
    }
  }, [getVendorDataResponse, countries]);

  const vimValuesMapping = () => {
    const formData = form.getFieldsValue();
    const companyToVendorMapping = {
      city: 'city',
      country: 'country',
      state: 'state',
      street: 'primaryAddress',
      street2: 'secondaryAddress',
      zip: 'zipCode',
    };
    const registrationAddressId = getVendorDataResponse?.registrationAddress?.id;
    const businessAddressId = getVendorDataResponse?.businessAddress?.id;

    const businessAddress = {
      ...mapObjKey(formData.address, companyToVendorMapping),
      country: countries.find((country: Country) => country.name === formData.address.country),
      id: businessAddressId,
    };

    const registrationAddress = sameRegistrationAddress
      ? { ...businessAddress, id: registrationAddressId }
      : {
          ...mapObjKey(formData.registrationAddress, companyToVendorMapping),
          id: registrationAddressId,
          country: countries.find((country: Country) => country.name === formData.registrationAddress?.country),
        };

    const vimPayload = {
      name: formData.companyName,
      registrationNumber: formData.registrationNumber,
      vat: formData.vatNumber || 'N/A',
      vendorType,
      businessAddress: {
        ...businessAddress,
      },
      registrationAddress: {
        ...registrationAddress,
      },
    };

    return { vimPayload };
  };

  const consoleCoreValuesMapping = () => {
    const formData = form.getFieldsValue();

    const consoleCorePayload = {
      ...formData,
      serviceType: vendorType,
      industryType: 'enterprise',
      companyTypes: ['PARTNER'],
      provider: formData.companyName,
      providerName: formData.companyName,
      providerStatus: 'ENABLED',
    };

    return { consoleCorePayload };
  };

  const docValuesMapping = (): { docsPayload: VendorDocumentData[] | null } => {
    const documentList = [];
    const formData = form.getFieldsValue();

    if (formData.documents.certificate) documentList.push(formData.documents.certificate);
    if (formData.documents['form-w-9']) documentList.push(formData.documents['form-w-9']);

    if (!documentList.length) return { docsPayload: null };
    return { docsPayload: documentList };
  };

  const postPayload = async (consoleCorePayload: CompanyCreate, vimPayload: Partial<VendorData>) => {
    const vimPostResponse = await createVendorMutation(vimPayload);
    await createCompanyMutation(consoleCorePayload);
    await createVendorId(vimPostResponse.id);
    setOnBoardingState((prevState) => ({ ...prevState, vendorId: vimPostResponse.id }));
  };

  const putPayload = async (consoleCorePayload: CompanyPatch, vimPayload: Partial<VendorData>) => {
    await updateVendorDataMutation({ ...getVendorDataResponse, ...vimPayload });
    await patchCompanyMutation(consoleCorePayload);
  };

  const submitForm = async () => {
    setRequestIsLoading(true);
    try {
      const { consoleCorePayload } = consoleCoreValuesMapping();
      const { vimPayload } = vimValuesMapping();
      const { docsPayload } = docValuesMapping();

      vendorId
        ? await putPayload(consoleCorePayload, vimPayload as Partial<VendorData>)
        : await postPayload(consoleCorePayload, vimPayload as Partial<VendorData>);
      if (docsPayload) {
        await Promise.all(docsPayload.map(async (doc) => await addVendorDoc(doc)));
      }
      displaySuccess('Company has been updated.');
      setRequestSuccess(true);
      setRequestIsLoading(false);
    } catch (err) {
      displayError(PAYLOAD_ERR_MSG);
      setRequestIsLoading(false);
    }
  };

  const handleCountrySelect = () => {
    const selectedCountryAddress = form.getFieldValue(['address', 'country']);
    const selectedCountryRegistrationAddress = form.getFieldValue(['registrationAddress', 'country']);
    const usa = 'United States';
    if (selectedCountryAddress === usa || selectedCountryRegistrationAddress === usa) return setUsaSelected(true);
    return setUsaSelected(false);
  };

  return (
    <div className={style.form}>
      <Form
        form={form}
        name="companyInfoForm"
        layout="vertical"
        requiredMark={false}
        onFieldsChange={handleCountrySelect}
        onFinish={submitForm}
      >
        <div className={style.space}>
          <Row gutter={32}>
            <Col span={12}>
              <Title level={5}>Company Information</Title>
            </Col>
          </Row>
        </div>
        <Row gutter={32}>
          <Col span={12}>
            <Form.Item
              tooltip={'Must match Certificate of Registration'}
              label="Company Legal Name"
              name="companyName"
              rules={[{ required: true, message: company.name.validation }]}
            >
              <Input placeholder={company.name.placeholder} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Registration Number"
              name="registrationNumber"
              rules={[{ required: true, message: company.registrationNo.validation }]}
            >
              <Input placeholder={company.registrationNo.placeholder} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={32}>
          <Col span={12}>
            <Form.Item label="VAT Number (if applicable)" name="vatNumber">
              <Input placeholder={company.VAT.placeholder} />
            </Form.Item>
          </Col>
        </Row>
        <div className={style.space}>
          <Row gutter={32}>
            <Col span={12}>
              <Title level={5}>Business Address</Title>
            </Col>
          </Row>
        </div>

        <AddressFields
          form={form}
          payloadName="address"
          stepNo={1}
          setCountries={setCountries}
          isStateRequired={true}
        />

        <Row gutter={32}>
          <Col span={12}>
            <Form.Item
              label="Company Website"
              name="website"
              rules={[{ required: true, message: company.website.validation }]}
            >
              <Input placeholder={company.website.placeholder} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Company Email"
              name="email"
              rules={[{ required: true, message: general.email.validation }, rules.vimEmail]}
            >
              <Input placeholder={general.email.placeholder} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={32}>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name={['address', 'telephone']}
              rules={[{ required: true, message: general.phone.validation }]}
            >
              <Input placeholder={general.phone.placeholder} />
            </Form.Item>
          </Col>
        </Row>

        <div className={style.space}>
          <Row gutter={32}>
            <Col span={6}>
              <Title level={5}>Registration Address</Title>
            </Col>
            <Col span={12}>
              <Checkbox
                checked={sameRegistrationAddress}
                onChange={() => setSameRegistrationAddress(!sameRegistrationAddress)}
              >
                Same as Business Address
              </Checkbox>
            </Col>
          </Row>
        </div>

        {!sameRegistrationAddress && (
          <AddressFields
            form={form}
            payloadName="registrationAddress"
            stepNo={1}
            setCountries={setCountries}
            isStateRequired={true}
          />
        )}

        <div className={style.space}>
          <Row gutter={32}>
            <Col span={6}>
              <Title level={5}>Documents</Title>
            </Col>
          </Row>
        </div>
        <Row gutter={32}>
          <Col span={12}>
            <OnboardingFileUpload
              fileType="certificate"
              documentList={getVendorDataResponse?.documents}
              vendorId={vendorId}
            />
          </Col>
          {usaSelected && (
            <Col span={12}>
              <OnboardingFileUpload fileType="W9" documentList={getVendorDataResponse?.documents} vendorId={vendorId} />
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default CompanyInfoForm;
