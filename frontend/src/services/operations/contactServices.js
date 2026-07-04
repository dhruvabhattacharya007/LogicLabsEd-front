import { toast } from 'react-hot-toast'
import { apiConnector } from '../apiConnector';
import { otherApi } from '../apis';

export const contactUs = async (contactData, setLoading, reset) => {
  setLoading(true);
  const toastId = toast.loading('Sending contact details ...')
  try {
    await apiConnector('POST', otherApi.POST_CONTACT_US, contactData);
    toast.success('Contact Details sent')

    reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNo: '',
      message: ''
    })
  } catch (error) {
    const message = error?.response?.data?.error
      || (error?.request ? 'Could not reach the server. Please check your connection and try again.' : 'Something went wrong. Please try again.');
    toast.error(message, { duration: 5000 });
  }
  toast.dismiss(toastId)
  setLoading(false);
}
